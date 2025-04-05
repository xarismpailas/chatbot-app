const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  metrics: {
    messageCount: {
      type: Number,
      default: 0
    },
    conversationCount: {
      type: Number,
      default: 0
    },
    tokenUsage: {
      prompt: {
        type: Number,
        default: 0
      },
      completion: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      }
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    aiModels: {
      type: Map,
      of: Number,
      default: {}
    },
    knowledgeBaseQueries: {
      type: Number,
      default: 0
    },
    topKnowledgeBases: [{
      knowledgeBase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KnowledgeBase'
      },
      queryCount: {
        type: Number,
        default: 0
      }
    }]
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
AnalyticsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Composite index for user + period + date
AnalyticsSchema.index({ user: 1, period: 1, date: 1 }, { unique: true });
AnalyticsSchema.index({ date: -1 });

// Static method to update analytics for a user
AnalyticsSchema.statics.updateMetrics = async function(userId, metrics, period = 'daily') {
  // Get current date based on period
  const now = new Date();
  let date;
  
  if (period === 'daily') {
    date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === 'weekly') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    date = new Date(now.getFullYear(), now.getMonth(), diff);
  } else if (period === 'monthly') {
    date = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  // Find or create analytics document
  let analytics = await this.findOne({ user: userId, period, date });
  
  if (!analytics) {
    analytics = new this({
      user: userId,
      period,
      date
    });
  }
  
  // Update metrics
  if (metrics.messageCount) {
    analytics.metrics.messageCount += metrics.messageCount;
  }
  
  if (metrics.conversationCount) {
    analytics.metrics.conversationCount += metrics.conversationCount;
  }
  
  if (metrics.tokenUsage) {
    analytics.metrics.tokenUsage.prompt += metrics.tokenUsage.prompt || 0;
    analytics.metrics.tokenUsage.completion += metrics.tokenUsage.completion || 0;
    analytics.metrics.tokenUsage.total += metrics.tokenUsage.total || 0;
  }
  
  if (metrics.responseTime) {
    // Weighted average calculation
    const currentTotal = analytics.metrics.averageResponseTime * analytics.metrics.messageCount;
    const newTotal = currentTotal + metrics.responseTime;
    analytics.metrics.averageResponseTime = newTotal / (analytics.metrics.messageCount + 1);
  }
  
  if (metrics.aiModel) {
    const aiModels = analytics.metrics.aiModels || new Map();
    const currentCount = aiModels.get(metrics.aiModel) || 0;
    aiModels.set(metrics.aiModel, currentCount + 1);
    analytics.metrics.aiModels = aiModels;
  }
  
  if (metrics.knowledgeBaseQuery) {
    analytics.metrics.knowledgeBaseQueries += 1;
    
    if (metrics.knowledgeBaseId) {
      // Check if knowledge base already exists in topKnowledgeBases
      const knowledgeBaseIndex = analytics.metrics.topKnowledgeBases.findIndex(
        kb => kb.knowledgeBase.toString() === metrics.knowledgeBaseId.toString()
      );
      
      if (knowledgeBaseIndex > -1) {
        analytics.metrics.topKnowledgeBases[knowledgeBaseIndex].queryCount += 1;
      } else {
        analytics.metrics.topKnowledgeBases.push({
          knowledgeBase: metrics.knowledgeBaseId,
          queryCount: 1
        });
      }
      
      // Sort by queryCount in descending order and limit to top 5
      analytics.metrics.topKnowledgeBases.sort((a, b) => b.queryCount - a.queryCount);
      analytics.metrics.topKnowledgeBases = analytics.metrics.topKnowledgeBases.slice(0, 5);
    }
  }
  
  await analytics.save();
  return analytics;
};

module.exports = mongoose.model('Analytics', AnalyticsSchema); 