const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DATABASE_NAME = process.env.SEGMENTATION_DB || 'newdatabase';

async function testDatabase() {
  let client;
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));
    console.log('Database:', DATABASE_NAME);
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected successfully\n');
    
    const db = client.db(DATABASE_NAME);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections in database:');
    collections.forEach(c => console.log(`  - ${c.name}`));
    console.log('');
    
    // Check customer_segmentation
    const segmentCollection = db.collection('customer_segmentation');
    const segmentCount = await segmentCollection.countDocuments();
    console.log(`📊 customer_segmentation: ${segmentCount} documents`);
    
    if (segmentCount > 0) {
      const sample = await segmentCollection.findOne();
      console.log('Sample document:', JSON.stringify(sample, null, 2));
    }
    console.log('');
    
    // Check orders
    const ordersCollection = db.collection('orders');
    const ordersCount = await ordersCollection.countDocuments();
    console.log(`📦 orders: ${ordersCount} documents`);
    
    if (ordersCount > 0) {
      const sample = await ordersCollection.findOne();
      console.log('Sample order:', JSON.stringify(sample, null, 2));
    }
    console.log('');
    
    // Check segmentation breakdown
    const segmentBreakdown = await segmentCollection.aggregate([
      {
        $group: {
          _id: '$segmentation.purchase_frequency',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('🏷️  Purchase Frequency Breakdown:');
    segmentBreakdown.forEach(s => console.log(`  ${s._id}: ${s.count}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

testDatabase();
