const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Rate limiting middleware for room creation
const createRoomLimiter = require('../middleware/rateLimiter').createRoom;

// Get all public rooms
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 20, language } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { 
      'settings.isPublic': true, 
      status: 'active' 
    };
    
    if (language) {
      query['settings.languages.code'] = language;
    }
    
    const rooms = await Room.find(query)
      .select('roomId name description host participants settings statistics startedAt')
      .sort({ startedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    // Add active participant count
    const roomsWithCounts = rooms.map(room => ({
      ...room,
      activeParticipants: room.participants.filter(p => p.isActive).length
    }));
    
    const total = await Room.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        rooms: roomsWithCounts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching public rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public rooms'
    });
  }
});

// Create a new room
router.post('/', createRoomLimiter, async (req, res) => {
  try {
    const {
      name,
      description = '',
      isPublic = false,
      allowRecording = false,
      autoTranslate = true,
      languages = [{ code: 'en', name: 'English' }],
      maxParticipants = 50,
      hostData
    } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Room name is required'
      });
    }
    
    if (!hostData || !hostData.userId) {
      return res.status(400).json({
        success: false,
        message: 'Host information is required'
      });
    }
    
    const roomId = uuidv4();
    
    const roomData = {
      roomId,
      name: name.trim(),
      description: description.trim(),
      host: {
        userId: hostData.userId,
        name: hostData.name,
        email: hostData.email
      },
      participants: [{
        userId: hostData.userId,
        name: hostData.name,
        email: hostData.email,
        language: hostData.language || 'en',
        joinedAt: new Date(),
        role: 'host',
        isActive: true
      }],
      settings: {
        isPublic,
        allowRecording,
        autoTranslate,
        languages,
        maxParticipants: Math.min(Math.max(maxParticipants, 1), 100) // Clamp between 1-100
      },
      statistics: {
        peakParticipants: 1
      }
    };
    
    const room = new Room(roomData);
    await room.save();
    
    // Update user's room list if user exists
    try {
      const user = await User.findOne({ email: hostData.email });
      if (user) {
        await user.joinRoom(roomId, 'host');
      }
    } catch (userError) {
      console.warn('Could not update user room list:', userError.message);
    }
    
    res.status(201).json({
      success: true,
      data: {
        room: {
          roomId: room.roomId,
          name: room.name,
          description: room.description,
          host: room.host,
          settings: room.settings,
          startedAt: room.startedAt,
          activeParticipants: 1
        }
      }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Room ID already exists, please try again'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create room'
    });
  }
});

// Get room details
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { includeHistory = false } = req.query;
    
    const room = await Room.findOne({ roomId }).lean();
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const responseData = {
      ...room,
      activeParticipants: room.participants.filter(p => p.isActive).length
    };
    
    // Include message history if requested
    if (includeHistory === 'true') {
      const Message = require('../models/Message');
      
      const [messages, subtitles] = await Promise.all([
        Message.findByRoom(roomId, 20),
        Message.findSubtitles(roomId, 10)
      ]);
      
      responseData.recentMessages = messages;
      responseData.recentSubtitles = subtitles;
    }
    
    res.json({
      success: true,
      data: { room: responseData }
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room details'
    });
  }
});

// Join a room
router.post('/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userData } = req.body;
    
    if (!userData || !userData.userId) {
      return res.status(400).json({
        success: false,
        message: 'User data is required'
      });
    }
    
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    if (room.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Room is not active'
      });
    }
    
    // Check if room is full
    const activeParticipants = room.participants.filter(p => p.isActive);
    if (activeParticipants.length >= room.settings.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Room is full'
      });
    }
    
    // Add participant to room
    await room.addParticipant({
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
      language: userData.language || 'en'
    });
    
    // Update user's room list if user exists
    try {
      const user = await User.findOne({ email: userData.email });
      if (user) {
        await user.joinRoom(roomId);
      }
    } catch (userError) {
      console.warn('Could not update user room list:', userError.message);
    }
    
    const updatedRoom = await Room.findOne({ roomId }).lean();
    
    res.json({
      success: true,
      data: {
        room: {
          ...updatedRoom,
          activeParticipants: updatedRoom.participants.filter(p => p.isActive).length
        }
      }
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join room'
    });
  }
});

// Leave a room
router.post('/:roomId/leave', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    await room.removeParticipant(userId);
    
    // Update user's room list if user exists
    try {
      const participant = room.participants.find(p => p.userId === userId);
      if (participant && participant.email) {
        const user = await User.findOne({ email: participant.email });
        if (user) {
          await user.leaveRoom(roomId);
        }
      }
    } catch (userError) {
      console.warn('Could not update user room list:', userError.message);
    }
    
    res.json({
      success: true,
      data: {
        message: 'Left room successfully'
      }
    });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave room'
    });
  }
});

// End a room (host only)
router.post('/:roomId/end', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Check if user is the host
    if (room.host.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can end the room'
      });
    }
    
    await room.endRoom();
    
    res.json({
      success: true,
      data: {
        message: 'Room ended successfully',
        endedAt: room.endedAt,
        statistics: room.statistics
      }
    });
  } catch (error) {
    console.error('Error ending room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end room'
    });
  }
});

// Get room statistics
router.get('/:roomId/stats', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { timeRange } = req.query; // in hours
    
    const room = await Room.findOne({ roomId }).lean();
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const Message = require('../models/Message');
    
    // Get message statistics
    const messageStats = await Message.getMessageStats(
      roomId, 
      timeRange ? parseInt(timeRange) * 60 * 60 * 1000 : null
    );
    
    const stats = {
      room: {
        duration: room.statistics.duration,
        status: room.status,
        startedAt: room.startedAt,
        endedAt: room.endedAt
      },
      participants: {
        total: room.participants.length,
        active: room.participants.filter(p => p.isActive).length,
        peak: room.statistics.peakParticipants
      },
      activity: {
        totalMessages: room.statistics.totalMessages,
        totalTranslations: room.statistics.totalTranslations,
        totalSubtitles: room.statistics.totalSubtitles
      },
      messageBreakdown: messageStats,
      languages: room.settings.languages
    };
    
    res.json({
      success: true,
      data: { statistics: stats }
    });
  } catch (error) {
    console.error('Error fetching room statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room statistics'
    });
  }
});

// Update room settings (host/moderator only)
router.patch('/:roomId/settings', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, settings } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Check if user can modify settings
    if (!room.isUserModerator(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only host or moderators can modify room settings'
      });
    }
    
    // Update allowed settings
    const allowedSettings = [
      'isPublic', 'allowRecording', 'autoTranslate', 
      'languages', 'maxParticipants'
    ];
    
    allowedSettings.forEach(setting => {
      if (settings[setting] !== undefined) {
        room.settings[setting] = settings[setting];
      }
    });
    
    await room.save();
    
    res.json({
      success: true,
      data: {
        settings: room.settings
      }
    });
  } catch (error) {
    console.error('Error updating room settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room settings'
    });
  }
});

// Search rooms
router.get('/search', async (req, res) => {
  try {
    const { q, language, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {
      'settings.isPublic': true,
      status: 'active'
    };
    
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (language) {
      query['settings.languages.code'] = language;
    }
    
    const rooms = await Room.find(query)
      .select('roomId name description host participants settings statistics startedAt')
      .sort({ startedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
    
    const roomsWithCounts = rooms.map(room => ({
      ...room,
      activeParticipants: room.participants.filter(p => p.isActive).length
    }));
    
    const total = await Room.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        rooms: roomsWithCounts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error searching rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search rooms'
    });
  }
});

module.exports = router;