const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  content: {
    originalText: {
      type: String,
      required: true,
    },
    translatedText: {
      type: String,
    },
    language: {
      type: String,
      required: true,
    },
    targetLanguage: {
      type: String,
    },
  },
  type: {
    type: String,
    enum: ['message', 'subtitle', 'translation', 'system'],
    default: 'message',
  },
  metadata: {
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 1,
    },
    isFinal: {
      type: Boolean,
      default: true,
    },
    processingTime: {
      type: Number, // in milliseconds
    },
    aiService: {
      type: String,
      enum: ['chrome-ai', 'google-translate', 'openai', 'local'],
    },
  },
  reactions: [{
    userId: String,
    userName: String,
    emoji: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  replies: [{
    messageId: String,
    userId: String,
    userName: String,
    content: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent',
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
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
messageSchema.index({ roomId: 1, timestamp: -1 });
messageSchema.index({ userId: 1, timestamp: -1 });
messageSchema.index({ type: 1, timestamp: -1 });
messageSchema.index({ 'content.language': 1 });
messageSchema.index({ status: 1 });

// Update the updatedAt field before saving
messageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
messageSchema.methods.addReaction = function(userId, userName, emoji) {
  // Remove existing reaction from this user if any
  this.reactions = this.reactions.filter(r => r.userId !== userId);
  
  // Add new reaction
  this.reactions.push({
    userId,
    userName,
    emoji,
    timestamp: new Date(),
  });
  
  return this.save();
};

messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.userId !== userId);
  return this.save();
};

messageSchema.methods.addReply = function(replyData) {
  this.replies.push({
    messageId: replyData.messageId,
    userId: replyData.userId,
    userName: replyData.userName,
    content: replyData.content,
    timestamp: new Date(),
  });
  
  return this.save();
};

messageSchema.methods.updateStatus = function(status) {
  this.status = status;
  return this.save();
};

messageSchema.methods.translate = function(translatedText, targetLanguage, aiService) {
  this.content.translatedText = translatedText;
  this.content.targetLanguage = targetLanguage;
  this.metadata.aiService = aiService;
  
  return this.save();
};

// Static methods
messageSchema.statics.findByRoom = function(roomId, limit = 50, skip = 0) {
  return this.find({ roomId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

messageSchema.statics.findByUser = function(userId, limit = 100) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

messageSchema.statics.findByLanguage = function(language, limit = 100) {
  return this.find({ 'content.language': language })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

messageSchema.statics.findSubtitles = function(roomId, limit = 50) {
  return this.find({ 
    roomId, 
    type: 'subtitle',
    'metadata.isFinal': true 
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

messageSchema.statics.findTranslations = function(roomId, sourceLanguage, targetLanguage, limit = 50) {
  const query = { roomId, type: 'translation' };
  
  if (sourceLanguage) {
    query['content.language'] = sourceLanguage;
  }
  
  if (targetLanguage) {
    query['content.targetLanguage'] = targetLanguage;
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

messageSchema.statics.getMessageStats = function(roomId, timeRange) {
  const matchStage = { roomId };
  
  if (timeRange) {
    matchStage.timestamp = {
      $gte: new Date(Date.now() - timeRange)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$metadata.confidence' },
        languages: { $addToSet: '$content.language' },
      }
    }
  ]);
};

messageSchema.statics.getUserMessageCount = function(userId, timeRange) {
  const matchStage = { userId };
  
  if (timeRange) {
    matchStage.timestamp = {
      $gte: new Date(Date.now() - timeRange)
    };
  }
  
  return this.countDocuments(matchStage);
};

messageSchema.statics.searchMessages = function(roomId, searchText, limit = 20) {
  return this.find({
    roomId,
    $or: [
      { 'content.originalText': { $regex: searchText, $options: 'i' } },
      { 'content.translatedText': { $regex: searchText, $options: 'i' } }
    ]
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

// Clean up old messages (older than 30 days by default)
messageSchema.statics.cleanupOldMessages = function(daysToKeep = 30) {
  const cutoffDate = new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000));
  
  return this.deleteMany({
    timestamp: { $lt: cutoffDate },
    type: { $ne: 'system' } // Keep system messages
  });
};

module.exports = mongoose.model('Message', messageSchema);