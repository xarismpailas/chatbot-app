const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Ticket title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Ticket description is required']
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'account', 'feature_request', 'other'],
    default: 'technical'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responses: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    name: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastResponseDate: {
    type: Date
  },
  resolvedDate: {
    type: Date
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
SupportTicketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update lastResponseDate when a new response is added
  if (this.isModified('responses')) {
    const responses = this.responses;
    if (responses && responses.length > 0) {
      this.lastResponseDate = responses[responses.length - 1].createdAt;
    }
  }
  
  // Set resolvedDate when status changes to resolved
  if (this.isModified('status') && this.status === 'resolved') {
    this.resolvedDate = Date.now();
  }
  
  next();
});

// Index for faster queries
SupportTicketSchema.index({ user: 1, createdAt: -1 });
SupportTicketSchema.index({ status: 1, priority: -1 });
SupportTicketSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('SupportTicket', SupportTicketSchema); 