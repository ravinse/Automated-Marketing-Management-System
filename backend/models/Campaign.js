const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Targeting Information
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  selectedFilters: [{
    type: String
  }],
  customerSegments: [{
    type: String
  }],
  
  // Content Information
  emailSubject: {
    type: String,
    trim: true
  },
  emailContent: {
    type: String,
    trim: true
  },
  smsContent: {
    type: String,
    trim: true
  },
  
  // Template Information
  templateName: {
    type: String,
    trim: true
  },
  
  // Attachments (storing file names/URLs)
  attachments: [{
    type: String
  }],
  
  // Tracking & Analytics
  sent: {
    type: Number,
    default: 0
  },
  opened: {
    type: Number,
    default: 0
  },
  clicked: {
    type: Number,
    default: 0
  },
  openRate: {
    type: String,
    default: '0%'
  },
  clickThroughRate: {
    type: String,
    default: '0%'
  },
  trackingUrl: {
    type: String,
    trim: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'running', 'completed', 'rejected'],
    default: 'draft'
  },
  
  // User who created the campaign
  createdBy: {
    type: String,
    required: true
  },
  
  // Current step/section being edited
  currentStep: {
    type: String,
    enum: ['basic', 'targeting', 'content', 'template'],
    default: 'basic'
  },
  
  // Timestamps
  submittedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Campaign", campaignSchema);
