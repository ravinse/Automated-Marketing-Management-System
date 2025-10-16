const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const { startCampaignScheduler } = require("./utils/campaignScheduler");
const { startSegmentationScheduler } = require("./utils/segmentationScheduler");

const app = express();

// Middleware
app.use(cors({ 
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180"]
})); // frontend port
app.use(express.json());
// Serve uploaded files
const path = require('path');
const fs = require('fs');
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {
  console.error('Failed to ensure uploads directory exists:', e);
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to DB
connectDB();

// Start schedulers only if enabled (disable in production/Railway to use cron jobs instead)
const ENABLE_SCHEDULERS = process.env.ENABLE_SCHEDULERS === 'true';

if (ENABLE_SCHEDULERS) {
  console.log('🔄 Starting internal schedulers...');
  // Start campaign scheduler to auto-complete expired campaigns
  startCampaignScheduler();
  // Start segmentation scheduler to auto-segment new customers
  startSegmentationScheduler();
} else {
  console.log('⚠️  Internal schedulers disabled. Use cron jobs or API endpoints to trigger tasks.');
}

// Routes
const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const userRoutes = require("./routes/users");
const feedbackRoutes = require("./routes/feedback");
const campaignRoutes = require("./routes/campaigns");
const templateRoutes = require("./routes/templates");
const segmentationRoutes = require("./routes/segmentation");
const trackingRoutes = require("./routes/tracking");

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/segmentation", segmentationRoutes);
app.use("/api/tracking", trackingRoutes);

app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
