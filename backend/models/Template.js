// ========================================
// TEMPLATE MODEL
// ========================================
// MongoDB schema for campaign templates
// Allows saving and reusing campaign content configurations
// Tracks template usage across campaigns

const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  // ========================================
  // TEMPLATE INFORMATION
  // ========================================
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // ========================================
  // CAMPAIGN CONTENT
  // ========================================
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
  
  // ========================================
  // TARGETING DEFAULTS
  // ========================================
  // Targeting defaults (optional)
  selectedFilters: [{
    type: String
  }],
  customerSegments: [{
    type: String
  }],
  
  // ========================================
  // METADATA & TRACKING
  // ========================================
  // Attachments (storing file names/URLs)
  attachments: [{
    type: String
  }],
  
  // User who created the template
  createdBy: {
    type: String,
    required: true
  },
  
  // Usage tracking
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Template", templateSchema);
