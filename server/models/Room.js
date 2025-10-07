const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  host: {
    userId: String,
    name: String,
    email: String,
  },
  participants: [{
    userId: String,
    name: String,
    email: String,
    language: String,
    joinedAt: Date,
    leftAt: Date,
    role: {
      type: String,
      enum: ['host', 'moderator', 'participant'],
      default: 'participant',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: false,
    },
    allowRecording: {
      type: Boolean,
      default: false,
    },
    autoTranslate: {
      type: Boolean,
      default: true,
    },
    languages: [{
      code: String,
      name: String,
    }],
    maxParticipants: {
      type: Number,
      default: 50,
    },
  },
  statistics: {
    totalMessages: {
      type: Number,
      default: 0,
    },
    totalTranslations: {
      type: Number,
      default: 0,
    },
    totalSubtitles: {
      type: Number,
      default: 0,
    },
    peakParticipants: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number, // in minutes
      default: 0,
    },
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'paused'],
    default: 'active',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for performance
roomSchema.index({ roomId: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ startedAt: -1 });
roomSchema.index({ 'participants.userId': 1 });
roomSchema.index({ 'host.userId': 1 });

// Update the updatedAt field before saving
roomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update duration if room is ending
  if (this.status === 'ended' && !this.endedAt) {
    this.endedAt = new Date();
    this.statistics.duration = Math.round((this.endedAt - this.startedAt) / (1000 * 60));
  }
  
  // Update peak participants
  const activeParticipants = this.participants.filter(p => p.isActive).length;
  if (activeParticipants > this.statistics.peakParticipants) {
    this.statistics.peakParticipants = activeParticipants;
  }
  
  next();
});

// Instance methods
roomSchema.methods.addParticipant = function(userData) {
  const existingParticipant = this.participants.find(p => p.userId === userData.userId);
  
  if (!existingParticipant) {
    this.participants.push({
      userId: userData.userId,
      name: userData.name,
      email: userData.email,
      language: userData.language || 'en',
      joinedAt: new Date(),
      role: userData.role || 'participant',
      isActive: true,
    });
  } else {
    // Reactivate if returning
    existingParticipant.isActive = true;
    existingParticipant.leftAt = undefined;
  }
  
  return this.save();
};

roomSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => p.userId === userId);
  
  if (participant) {
    participant.isActive = false;
    participant.leftAt = new Date();
  }
  
  return this.save();
};

roomSchema.methods.updateStats = function(type, count = 1) {
  switch (type) {
    case 'message':
      this.statistics.totalMessages += count;
      break;
    case 'translation':
      this.statistics.totalTranslations += count;
      break;
    case 'subtitle':
      this.statistics.totalSubtitles += count;
      break;
  }
  
  return this.save();
};

roomSchema.methods.endRoom = function() {
  this.status = 'ended';
  this.endedAt = new Date();
  
  // Mark all participants as inactive
  this.participants.forEach(participant => {
    if (participant.isActive) {
      participant.isActive = false;
      participant.leftAt = new Date();
    }
  });
  
  return this.save();
};

roomSchema.methods.getActiveParticipants = function() {
  return this.participants.filter(p => p.isActive);
};

roomSchema.methods.isUserInRoom = function(userId) {
  return this.participants.some(p => p.userId === userId && p.isActive);
};

roomSchema.methods.isUserHost = function(userId) {
  return this.host.userId === userId;
};

roomSchema.methods.isUserModerator = function(userId) {
  const participant = this.participants.find(p => p.userId === userId && p.isActive);
  return participant && (participant.role === 'host' || participant.role === 'moderator');
};

// Static methods
roomSchema.statics.findByRoomId = function(roomId) {
  return this.findOne({ roomId });
};

roomSchema.statics.findActiveRooms = function() {
  return this.find({ status: 'active' });
};

roomSchema.statics.findUserRooms = function(userId) {
  return this.find({
    $or: [
      { 'host.userId': userId },
      { 'participants.userId': userId, 'participants.isActive': true }
    ]
  });
};

roomSchema.statics.findPublicRooms = function(limit = 20) {
  return this.find({ 
    'settings.isPublic': true, 
    status: 'active' 
  })
  .sort({ startedAt: -1 })
  .limit(limit);
};

roomSchema.statics.getRoomStats = function() {
  return this.aggregate([
    {
      $match: { status: 'active' }
    },
    {
      $group: {
        _id: null,
        totalActiveRooms: { $sum: 1 },
        totalActiveParticipants: { 
          $sum: { 
            $size: { 
              $filter: { 
                input: '$participants', 
                cond: { $eq: ['$$this.isActive', true] } 
              } 
            } 
          } 
        },
        avgParticipantsPerRoom: { 
          $avg: { 
            $size: { 
              $filter: { 
                input: '$participants', 
                cond: { $eq: ['$$this.isActive', true] } 
              } 
            } 
          } 
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Room', roomSchema);