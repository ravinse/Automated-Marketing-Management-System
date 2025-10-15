const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DATABASE_NAME = process.env.SEGMENTATION_DB || 'retail_db';
const SEGMENTATION_COLLECTION = process.env.SEGMENTATION_COLLECTION || 'customer_segmentation';

async function addCustomerToSegmentation() {
  let client;
  try {
    console.log('🔧 Adding CUS80000 to customer_segmentation collection...\n');

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(DATABASE_NAME);
    const segmentationCollection = db.collection(SEGMENTATION_COLLECTION);

    // Check if already exists
    const existing = await segmentationCollection.findOne({ customer_id: 'CUS80000' });
    
    if (existing) {
      console.log('⚠️  Customer CUS80000 already exists in segmentation collection');
      console.log('Current segmentation:', JSON.stringify(existing.segmentation, null, 2));
      return;
    }

    // Add the new segmentation document
    const newSegmentation = {
      customer_id: 'CUS80000',
      segmentation: {
        purchase_frequency: 'New',      // Recent order = New customer
        spending: 'Medium Value',        // Based on order amount (21,000 LKR)
        category: 'Mens'                 // Based on product category
      }
    };

    console.log('📝 Adding document:');
    console.log(JSON.stringify(newSegmentation, null, 2));
    console.log();

    const result = await segmentationCollection.insertOne(newSegmentation);
    
    if (result.acknowledged) {
      console.log('✅ SUCCESS! Customer CUS80000 added to segmentation collection');
      console.log('   Inserted ID:', result.insertedId);
      console.log();
      console.log('🎉 Customer CUS80000 will now appear when selecting "New Customers" in campaigns!');
      console.log();
      console.log('📊 To verify, run the campaign segmentation with:');
      console.log('   - Customer Segments: ["New Customers"]');
      console.log('   - Days Period: 14');
    } else {
      console.log('❌ Insert failed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Disconnected from MongoDB');
    }
  }
}

addCustomerToSegmentation();
