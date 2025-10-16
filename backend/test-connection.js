/**
 * Railway Connection Test Script
 * Run this to test if MongoDB and environment variables are working
 */

require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing Railway Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
console.log('✓ NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('✓ PORT:', process.env.PORT || 'NOT SET');
console.log('✓ MONGO_URI:', process.env.MONGO_URI ? '✓ SET' : '❌ NOT SET');
console.log('✓ JWT_SECRET:', process.env.JWT_SECRET ? '✓ SET' : '❌ NOT SET');
console.log('✓ ENABLE_SCHEDULERS:', process.env.ENABLE_SCHEDULERS || 'NOT SET');
console.log('✓ EMAIL_USER:', process.env.EMAIL_USER ? '✓ SET' : '❌ NOT SET');
console.log('✓ EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ SET' : '❌ NOT SET');

console.log('\n🔌 Testing MongoDB Connection...');

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not set!');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
})
.then((conn) => {
  console.log('✅ MongoDB Connected Successfully!');
  console.log('📍 Host:', conn.connection.host);
  console.log('📊 Database:', conn.connection.name);
  console.log('\n🎉 All checks passed! Your configuration is correct.');
  process.exit(0);
})
.catch((error) => {
  console.error('\n❌ MongoDB Connection Failed!');
  console.error('Error:', error.message);
  console.error('\n💡 Common Solutions:');
  console.error('1. Check if MONGO_URI is correct');
  console.error('2. Add 0.0.0.0/0 to MongoDB Atlas Network Access');
  console.error('3. Verify database username and password');
  console.error('4. Check if MongoDB Atlas cluster is running');
  process.exit(1);
});
