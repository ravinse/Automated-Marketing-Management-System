// ========================================
// CUSTOMER MODEL
// ========================================
// MongoDB schema for customer data
// Includes purchase history, preferences, and ML-based segmentation
// Used for campaign targeting and analytics

const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  purchaseHistory: [
    {
      product: String,
      amount: Number,
      date: { type: Date, default: Date.now }
    }
  ],
  preferences: { type: [String], default: [] }, 
  segment: { type: String, default: "unassigned" }, 
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
