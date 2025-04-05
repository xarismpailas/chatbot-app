const mongoose = require('mongoose');

const KnowledgeSourceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  knowledgeBase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeBase',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Source name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['file', 'text', 'url', 'api'],
    default: 'text'
  },
  content: {
    type: String
  },
  fileUrl: {
    type: String
  },
  filePath: {
    type: String
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'txt', 'csv', 'json', 'html', 'other']
  },
  url: {
    type: String
  },
  apiEndpoint: {
    type: String
  },
  apiKey: {
    type: String
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'not_started'],
    default: 'not_started'
  },
  processingError: {
    type: String
  },
  metadata: {
    documentCount: {
      type: Number,
      default: 0
    },
    tokenCount: {
      type: Number,
      default: 0
    },
    fileSize: {
      type: Number
    },
    lastProcessedDate: {
      type: Date
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
KnowledgeSourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
KnowledgeSourceSchema.index({ knowledgeBase: 1, createdAt: -1 });
KnowledgeSourceSchema.index({ user: 1, knowledgeBase: 1 });

module.exports = mongoose.model('KnowledgeSource', KnowledgeSourceSchema); 