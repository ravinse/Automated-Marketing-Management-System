const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');
  
  const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
  console.log('Using connection string:', MONGODB_URI ? '✓ Found in .env' : '✗ NOT FOUND');
  
  if (!MONGODB_URI) {
    console.error('❌ No MongoDB connection string found in environment variables');
    process.exit(1);
  }

  let client;
  try {
    console.log('\n📡 Connecting to MongoDB Atlas...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!\n');

    // Test retail_db database
    const db = client.db('retail_db');
    console.log('📊 Checking retail_db database...');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Available collections in retail_db:');
    collections.forEach(col => console.log(`   - ${col.name}`));

    // Check customer_segmentation collection
    const segmentationCollection = db.collection('customer_segmentation');
    const count = await segmentationCollection.countDocuments();
    console.log(`\n👥 customer_segmentation collection: ${count} documents found`);

    if (count > 0) {
      // Get sample document
      const sample = await segmentationCollection.findOne();
      console.log('\n📄 Sample document structure:');
      console.log(JSON.stringify(sample, null, 2));

      // Get segmentation statistics
      const pipeline = [
        {
          $group: {
            _id: null,
            newCustomers: {
              $sum: {
                $cond: [{ $eq: ['$segmentation.purchase_frequency', 'New'] }, 1, 0]
              }
            },
            loyalCustomers: {
              $sum: {
                $cond: [{ $eq: ['$segmentation.purchase_frequency', 'Loyal'] }, 1, 0]
              }
            },
            lapsedCustomers: {
              $sum: {
                $cond: [{ $eq: ['$segmentation.purchase_frequency', 'Lapsed'] }, 1, 0]
              }
            },
            seasonalCustomers: {
              $sum: {
                $cond: [{ $eq: ['$segmentation.purchase_frequency', 'Seasonal'] }, 1, 0]
              }
            }
          }
        }
      ];

      const stats = await segmentationCollection.aggregate(pipeline).toArray();
      console.log('\n📈 Segmentation breakdown:');
      if (stats.length > 0) {
        console.log(`   - New Customers: ${stats[0].newCustomers}`);
        console.log(`   - Loyal Customers: ${stats[0].loyalCustomers}`);
        console.log(`   - Lapsed Customers: ${stats[0].lapsedCustomers}`);
        console.log(`   - Seasonal Customers: ${stats[0].seasonalCustomers}`);
      }
    } else {
      console.log('\n⚠️  Warning: customer_segmentation collection is empty!');
      console.log('   You need to import the segmentation data first.');
    }

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused - check your MongoDB URI in .env file');
    } else if (error.name === 'MongoServerError') {
      console.log('\n💡 Authentication failed - check your MongoDB credentials');
    }
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Connection closed');
    }
  }
}

testConnection();
