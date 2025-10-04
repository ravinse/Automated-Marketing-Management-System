const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
  // Template Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Campaign Content
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
  
  // Targeting defaults (optional)
  selectedFilters: [{
    type: String
  }],
  customerSegments: [{
    type: String
  }],
  
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
