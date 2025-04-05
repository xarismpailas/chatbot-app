const mongoose = require('mongoose');

const KnowledgeBaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Knowledge base name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeSource'
  }],
  vectorStore: {
    type: String,
    enum: ['pinecone', 'weaviate', 'local'],
    default: 'local'
  },
  vectorStoreId: {
    type: String
  },
  metadata: {
    sourceCount: {
      type: Number,
      default: 0
    },
    documentCount: {
      type: Number,
      default: 0
    },
    totalTokens: {
      type: Number,
      default: 0
    },
    lastTrainingDate: {
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
KnowledgeBaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
KnowledgeBaseSchema.index({ user: 1, createdAt: -1 });
KnowledgeBaseSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model('KnowledgeBase', KnowledgeBaseSchema); 