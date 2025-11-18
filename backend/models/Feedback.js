// ========================================
// FEEDBACK MODEL
// ========================================
// MongoDB schema for campaign feedback and ratings
// Captures customer feedback on campaign effectiveness
// Used for performance analytics and improvement

// ========================================
// FEEDBACK MODEL
// ========================================
// MongoDB schema for campaign feedback and ratings
// Captures customer feedback on campaign effectiveness
// Used for performance analytics and improvement

const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  campaign: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Feedback", feedbackSchema);
