const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  lastMessage: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  messageCount: {
    type: Number,
    default: 0
  },
  knowledgeBase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeBase'
  },
  metadata: {
    totalTokens: {
      type: Number,
      default: 0
    },
    settings: {
      temperature: {
        type: Number,
        default: 0.7
      },
      model: {
        type: String,
        default: 'gpt-4'
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
ConversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
ConversationSchema.index({ user: 1, createdAt: -1 });
ConversationSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema); 