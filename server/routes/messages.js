const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Room = require('../models/Room');
const { v4: uuidv4 } = require('uuid');

// Rate limiting middleware
const messageLimiter = require('../middleware/rateLimiter').message;

// Get messages for a room
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { 
      page = 1, 
      limit = 50, 
      type, 
      language,
      userId,
      search 
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Verify room exists and user has access
    const room = await Room.findOne({ roomId }).lean();
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Build query
    let query = { roomId };
    
    if (type) {
      query.type = type;
    }
    
    if (language) {
      query['content.language'] = language;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    if (search) {
      query.$or = [
        { 'content.originalText': { $regex: search, $options: 'i' } },
        { 'content.translatedText': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Special handling for subtitles - only final ones
    if (type === 'subtitle') {
      query['metadata.isFinal'] = true;
    }
    
    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const total = await Message.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Create a new message
router.post('/', messageLimiter, async (req, res) => {
  try {
    const {
      roomId,
      userId,
      userName,
      content,
      type = 'message',
      metadata = {},
      timestamp = Date.now()
    } = req.body;
    
    // Validate required fields
    if (!roomId || !userId || !userName || !content || !content.originalText) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Verify room exists and user is in room
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    if (!room.isUserInRoom(userId)) {
      return res.status(403).json({
        success: false,
        message: 'User not in room'
      });
    }
    
    const messageId = uuidv4();
    
    const messageData = {
      messageId,
      roomId,
      userId,
      userName,
      content: {
        originalText: content.originalText,
        translatedText: content.translatedText || null,
        language: content.language || 'en',
        targetLanguage: content.targetLanguage || null
      },
      type,
      metadata: {
        confidence: metadata.confidence || 1.0,
        isFinal: metadata.isFinal !== false, // Default to true
        processingTime: metadata.processingTime || null,
        aiService: metadata.aiService || null
      },
      timestamp: new Date(timestamp)
    };
    
    const message = new Message(messageData);
    await message.save();
    
    // Update room statistics
    await room.updateStats(type);
    
    res.status(201).json({
      success: true,
      data: { message }
    });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create message'
    });
  }
});

// Get a specific message
router.get('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findOne({ messageId }).lean();
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      data: { message }
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message'
    });
  }
});

// Add reaction to a message
router.post('/:messageId/reactions', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, userName, emoji } = req.body;
    
    if (!userId || !userName || !emoji) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, userName, emoji'
      });
    }
    
    const message = await Message.findOne({ messageId });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Verify user is in the room
    const room = await Room.findOne({ roomId: message.roomId });
    if (!room || !room.isUserInRoom(userId)) {
      return res.status(403).json({
        success: false,
        message: 'User not authorized'
      });
    }
    
    await message.addReaction(userId, userName, emoji);
    
    res.json({
      success: true,
      data: { 
        message: 'Reaction added',
        reactions: message.reactions 
      }
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction'
    });
  }
});

// Remove reaction from a message
router.delete('/:messageId/reactions', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const message = await Message.findOne({ messageId });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    await message.removeReaction(userId);
    
    res.json({
      success: true,
      data: { 
        message: 'Reaction removed',
        reactions: message.reactions 
      }
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove reaction'
    });
  }
});

// Add reply to a message
router.post('/:messageId/replies', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, userName, content } = req.body;
    
    if (!userId || !userName || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, userName, content'
      });
    }
    
    const message = await Message.findOne({ messageId });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Verify user is in the room
    const room = await Room.findOne({ roomId: message.roomId });
    if (!room || !room.isUserInRoom(userId)) {
      return res.status(403).json({
        success: false,
        message: 'User not authorized'
      });
    }
    
    const replyData = {
      messageId: uuidv4(),
      userId,
      userName,
      content
    };
    
    await message.addReply(replyData);
    
    res.json({
      success: true,
      data: { 
        message: 'Reply added',
        replies: message.replies 
      }
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply'
    });
  }
});

// Update message translation
router.patch('/:messageId/translation', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { translatedText, targetLanguage, aiService } = req.body;
    
    if (!translatedText || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'translatedText and targetLanguage are required'
      });
    }
    
    const message = await Message.findOne({ messageId });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    await message.translate(translatedText, targetLanguage, aiService);
    
    res.json({
      success: true,
      data: { message }
    });
  } catch (error) {
    console.error('Error updating translation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update translation'
    });
  }
});

// Update message status
router.patch('/:messageId/status', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    
    if (!status || !['sent', 'delivered', 'read', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (sent, delivered, read, failed)'
      });
    }
    
    const message = await Message.findOne({ messageId });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    await message.updateStatus(status);
    
    res.json({
      success: true,
      data: { 
        message: 'Status updated',
        status: message.status 
      }
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
});

// Search messages across all accessible rooms for a user
router.get('/search/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { q, roomId, type, language, limit = 50 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    let query = {
      $or: [
        { 'content.originalText': { $regex: q, $options: 'i' } },
        { 'content.translatedText': { $regex: q, $options: 'i' } }
      ]
    };
    
    // If specific room, search only in that room
    if (roomId) {
      query.roomId = roomId;
      
      // Verify user has access to the room
      const room = await Room.findOne({ roomId });
      if (!room || !room.isUserInRoom(userId)) {
        return res.status(403).json({
          success: false,
          message: 'User not authorized to search this room'
        });
      }
    } else {
      // Get all rooms user has access to
      const userRooms = await Room.find({
        $or: [
          { 'host.userId': userId },
          { 'participants.userId': userId, 'participants.isActive': true }
        ]
      }).select('roomId').lean();
      
      const roomIds = userRooms.map(room => room.roomId);
      query.roomId = { $in: roomIds };
    }
    
    if (type) {
      query.type = type;
    }
    
    if (language) {
      query['content.language'] = language;
    }
    
    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      data: {
        messages,
        searchQuery: q,
        total: messages.length
      }
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages'
    });
  }
});

// Get message statistics for a user
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeRange = 24 } = req.query; // hours
    
    const timeRangeMs = parseInt(timeRange) * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - timeRangeMs);
    
    const stats = await Message.aggregate([
      {
        $match: {
          userId,
          timestamp: { $gte: cutoffDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$metadata.confidence' },
          languages: { $addToSet: '$content.language' }
        }
      }
    ]);
    
    const totalMessages = await Message.getUserMessageCount(userId, timeRangeMs);
    
    res.json({
      success: true,
      data: {
        statistics: {
          totalMessages,
          breakdown: stats,
          timeRange: `${timeRange} hours`
        }
      }
    });
  } catch (error) {
    console.error('Error fetching message statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch message statistics'
    });
  }
});

// Delete old messages (cleanup endpoint)
router.delete('/cleanup', async (req, res) => {
  try {
    const { daysToKeep = 30, adminKey } = req.body;
    
    // Simple admin authentication (in production, use proper auth)
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    const result = await Message.cleanupOldMessages(parseInt(daysToKeep));
    
    res.json({
      success: true,
      data: {
        deletedCount: result.deletedCount,
        daysKept: parseInt(daysToKeep)
      }
    });
  } catch (error) {
    console.error('Error cleaning up messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup messages'
    });
  }
});

module.exports = router;