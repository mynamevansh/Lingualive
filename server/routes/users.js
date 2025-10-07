const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');

// Rate limiting middleware
const userLimiter = require('../middleware/rateLimiter').user;

// Create or update user
router.post('/', userLimiter, async (req, res) => {
  try {
    const {
      email,
      name,
      preferredLanguage = 'en',
      settings = {}
    } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }
    
    // Check if user already exists
    let user = await User.findByEmail(email);
    
    if (user) {
      // Update existing user
      user.name = name;
      user.preferredLanguage = preferredLanguage;
      user.settings = { ...user.settings, ...settings };
      await user.updateLastActive();
    } else {
      // Create new user
      user = new User({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        preferredLanguage,
        settings: {
          theme: settings.theme || 'system',
          autoTranslate: settings.autoTranslate !== false,
          showSubtitles: settings.showSubtitles !== false,
          notificationSound: settings.notificationSound !== false,
          speechRecognition: settings.speechRecognition !== false,
          translationLanguages: settings.translationLanguages || ['en']
        }
      });
      
      await user.save();
    }
    
    // Remove sensitive info before sending response
    const userResponse = user.toObject();
    delete userResponse.__v;
    
    res.json({
      success: true,
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create/update user'
    });
  }
});

// Get user by email
router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update last active
    await user.updateLastActive();
    
    const userResponse = user.toObject();
    delete userResponse.__v;
    
    res.json({
      success: true,
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Update user settings
router.patch('/:email/settings', async (req, res) => {
  try {
    const { email } = req.params;
    const { settings } = req.body;
    
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'Settings are required'
      });
    }
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update settings
    user.settings = { ...user.settings, ...settings };
    await user.save();
    
    res.json({
      success: true,
      data: { 
        message: 'Settings updated successfully',
        settings: user.settings 
      }
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user settings'
    });
  }
});

// Get user rooms
router.get('/:email/rooms', async (req, res) => {
  try {
    const { email } = req.params;
    const { status = 'active' } = req.query;
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get rooms where user is host or participant
    let query = {
      $or: [
        { 'host.email': email },
        { 'participants.email': email, 'participants.isActive': true }
      ]
    };
    
    if (status) {
      query.status = status;
    }
    
    const rooms = await Room.find(query)
      .select('roomId name description host participants settings statistics startedAt status')
      .sort({ startedAt: -1 })
      .lean();
    
    const roomsWithDetails = rooms.map(room => ({
      ...room,
      activeParticipants: room.participants.filter(p => p.isActive).length,
      userRole: room.host.email === email ? 'host' : 'participant'
    }));
    
    res.json({
      success: true,
      data: { rooms: roomsWithDetails }
    });
  } catch (error) {
    console.error('Error fetching user rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user rooms'
    });
  }
});

// Get user statistics
router.get('/:email/statistics', async (req, res) => {
  try {
    const { email } = req.params;
    const { timeRange = 30 } = req.query; // days
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const timeRangeMs = parseInt(timeRange) * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - timeRangeMs);
    
    // Get recent activity
    const [recentRooms, recentMessages] = await Promise.all([
      Room.find({
        $or: [
          { 'host.email': email },
          { 'participants.email': email }
        ],
        startedAt: { $gte: cutoffDate }
      }).countDocuments(),
      
      Message.find({
        userId: user._id.toString(),
        timestamp: { $gte: cutoffDate }
      }).countDocuments()
    ]);
    
    // Get language breakdown
    const languageStats = await Message.aggregate([
      {
        $match: {
          userId: user._id.toString(),
          timestamp: { $gte: cutoffDate }
        }
      },
      {
        $group: {
          _id: '$content.language',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const statistics = {
      overall: user.statistics,
      recent: {
        roomsJoined: recentRooms,
        messagesSent: recentMessages,
        timeRange: `${timeRange} days`
      },
      languages: languageStats.map(stat => ({
        language: stat._id,
        messageCount: stat.count
      }))
    };
    
    res.json({
      success: true,
      data: { statistics }
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

// Update user preferred language
router.patch('/:email/language', async (req, res) => {
  try {
    const { email } = req.params;
    const { language } = req.body;
    
    if (!language) {
      return res.status(400).json({
        success: false,
        message: 'Language is required'
      });
    }
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.preferredLanguage = language;
    await user.save();
    
    res.json({
      success: true,
      data: { 
        message: 'Language updated successfully',
        preferredLanguage: user.preferredLanguage 
      }
    });
  } catch (error) {
    console.error('Error updating user language:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user language'
    });
  }
});

// Add translation language to user preferences
router.post('/:email/translation-languages', async (req, res) => {
  try {
    const { email } = req.params;
    const { language } = req.body;
    
    if (!language) {
      return res.status(400).json({
        success: false,
        message: 'Language is required'
      });
    }
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.settings.translationLanguages.includes(language)) {
      user.settings.translationLanguages.push(language);
      await user.save();
    }
    
    res.json({
      success: true,
      data: { 
        message: 'Translation language added',
        translationLanguages: user.settings.translationLanguages 
      }
    });
  } catch (error) {
    console.error('Error adding translation language:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add translation language'
    });
  }
});

// Remove translation language from user preferences
router.delete('/:email/translation-languages/:language', async (req, res) => {
  try {
    const { email, language } = req.params;
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.settings.translationLanguages = user.settings.translationLanguages.filter(
      lang => lang !== language
    );
    await user.save();
    
    res.json({
      success: true,
      data: { 
        message: 'Translation language removed',
        translationLanguages: user.settings.translationLanguages 
      }
    });
  } catch (error) {
    console.error('Error removing translation language:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove translation language'
    });
  }
});

// Get active users (for admin/stats purposes)
router.get('/', async (req, res) => {
  try {
    const { hours = 24, limit = 50, adminKey } = req.query;
    
    // Simple admin authentication (in production, use proper auth)
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    const activeUsers = await User.getActiveUsers(parseInt(hours))
      .select('email name preferredLanguage statistics.lastActive statistics.meetingsJoined')
      .limit(parseInt(limit))
      .sort({ 'statistics.lastActive': -1 });
    
    res.json({
      success: true,
      data: { 
        users: activeUsers,
        timeRange: `${hours} hours`
      }
    });
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active users'
    });
  }
});

// Delete user account
router.delete('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { confirmEmail } = req.body;
    
    if (confirmEmail !== email) {
      return res.status(400).json({
        success: false,
        message: 'Email confirmation does not match'
      });
    }
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove user from all rooms
    await Room.updateMany(
      { 'participants.email': email },
      { 
        $set: { 
          'participants.$.isActive': false,
          'participants.$.leftAt': new Date()
        } 
      }
    );
    
    // Delete user
    await User.deleteOne({ email });
    
    res.json({
      success: true,
      data: { message: 'User account deleted successfully' }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user account'
    });
  }
});

module.exports = router;