const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  preferredLanguage: {
    type: String,
    default: 'en',
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    autoTranslate: {
      type: Boolean,
      default: true,
    },
    showSubtitles: {
      type: Boolean,
      default: true,
    },
    notificationSound: {
      type: Boolean,
      default: true,
    },
    speechRecognition: {
      type: Boolean,
      default: true,
    },
    translationLanguages: [{
      type: String,
    }],
  },
  statistics: {
    meetingsJoined: {
      type: Number,
      default: 0,
    },
    messagesTranslated: {
      type: Number,
      default: 0,
    },
    minutesInMeetings: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  rooms: [{
    roomId: String,
    joinedAt: Date,
    lastActive: Date,
    role: {
      type: String,
      enum: ['host', 'participant'],
      default: 'participant',
    },
  }],
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
userSchema.index({ email: 1 });
userSchema.index({ 'statistics.lastActive': -1 });
userSchema.index({ 'rooms.roomId': 1 });

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
userSchema.methods.updateLastActive = function() {
  this.statistics.lastActive = new Date();
  return this.save();
};

userSchema.methods.joinRoom = function(roomId, role = 'participant') {
  const existingRoom = this.rooms.find(room => room.roomId === roomId);
  
  if (!existingRoom) {
    this.rooms.push({
      roomId,
      joinedAt: new Date(),
      lastActive: new Date(),
      role,
    });
    this.statistics.meetingsJoined += 1;
  } else {
    existingRoom.lastActive = new Date();
  }
  
  return this.save();
};

userSchema.methods.leaveRoom = function(roomId) {
  this.rooms = this.rooms.filter(room => room.roomId !== roomId);
  return this.save();
};

userSchema.methods.incrementTranslations = function(count = 1) {
  this.statistics.messagesTranslated += count;
  return this.save();
};

userSchema.methods.addMeetingTime = function(minutes) {
  this.statistics.minutesInMeetings += minutes;
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.getActiveUsers = function(hours = 24) {
  const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return this.find({ 'statistics.lastActive': { $gte: cutoff } });
};

userSchema.statics.getUsersInRoom = function(roomId) {
  return this.find({ 'rooms.roomId': roomId });
};

module.exports = mongoose.model('User', userSchema);