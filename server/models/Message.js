const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required']
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  conversationId: {
    type: String,
    required: true
  },
  metadata: {
    tokens: {
      prompt: Number,
      completion: Number,
      total: Number
    },
    processingTime: Number,
    model: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  knowledgeSourceIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeSource'
  }]
});

// Index for faster queries
MessageSchema.index({ user: 1, conversationId: 1 });
MessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema); 