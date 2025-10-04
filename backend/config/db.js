const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use MONGODB_URI for feedback database, fallback to MONGO_URI for other data
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
