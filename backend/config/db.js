const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use MONGODB_URI for feedback database, fallback to MONGO_URI for other data
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!uri) {
      console.error("❌ FATAL: No MongoDB connection string found!");
      console.error("Please set MONGO_URI or MONGODB_URI environment variable");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    console.log(`📍 Database: ${uri.split('@')[1]?.split('?')[0] || 'unknown'}`);
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error("Full error:", error);
    console.error("\n📋 Troubleshooting:");
    console.error("1. Check if MONGO_URI environment variable is set");
    console.error("2. Verify MongoDB Atlas cluster is running");
    console.error("3. Check Network Access in MongoDB Atlas (allow 0.0.0.0/0)");
    console.error("4. Verify database user credentials");
    process.exit(1);
  }
};

module.exports = connectDB;
