const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importSegmentationData() {
  console.log('📤 Importing Customer Segmentation Data to MongoDB Atlas...\n');
  
  const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ No MongoDB connection string found in environment variables');
    process.exit(1);
  }

  // Read the JSON file
  const dataPath = path.join(__dirname, '..', 'output', 'customer_segmentation.json');
  console.log(`📂 Reading data from: ${dataPath}`);
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ customer_segmentation.json not found in output folder');
    process.exit(1);
  }

  let client;
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`✅ Loaded ${data.length} customer records from file\n`);

    console.log('📡 Connecting to MongoDB Atlas...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = client.db('retail_db');
    const collection = db.collection('customer_segmentation');

    // Check if collection already has data
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Collection already has ${existingCount} documents`);
      console.log('🗑️  Clearing existing data...');
      await collection.deleteMany({});
      console.log('✅ Existing data cleared\n');
    }

    console.log('💾 Inserting customer segmentation data...');
    
    // Insert in batches for better performance
    const batchSize = 1000;
    let inserted = 0;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      await collection.insertMany(batch, { ordered: false });
      inserted += batch.length;
      process.stdout.write(`\r   Progress: ${inserted}/${data.length} records inserted`);
    }
    
    console.log('\n\n✅ Data import completed successfully!');

    // Verify the import
    const finalCount = await collection.countDocuments();
    console.log(`\n📊 Verification:`);
    console.log(`   Total documents in collection: ${finalCount}`);

    // Get segmentation statistics
    const stats = await collection.aggregate([
      {
        $group: {
          _id: null,
          newCustomers: {
            $sum: { $cond: [{ $eq: ['$segmentation.purchase_frequency', 'New'] }, 1, 0] }
          },
          loyalCustomers: {
            $sum: { $cond: [{ $eq: ['$segmentation.purchase_frequency', 'Loyal'] }, 1, 0] }
          },
          lapsedCustomers: {
            $sum: { $cond: [{ $eq: ['$segmentation.purchase_frequency', 'Lapsed'] }, 1, 0] }
          },
          seasonalCustomers: {
            $sum: { $cond: [{ $eq: ['$segmentation.purchase_frequency', 'Seasonal'] }, 1, 0] }
          },
          highValue: {
            $sum: { $cond: [{ $eq: ['$segmentation.spending', 'High Value Customer'] }, 1, 0] }
          },
          mediumValue: {
            $sum: { $cond: [{ $eq: ['$segmentation.spending', 'Medium Value'] }, 1, 0] }
          },
          lowValue: {
            $sum: { $cond: [{ $eq: ['$segmentation.spending', 'Low Value Customer'] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    if (stats.length > 0) {
      console.log(`\n📈 Segmentation Breakdown:`);
      console.log(`   Shopping Frequency:`);
      console.log(`     - New Customers: ${stats[0].newCustomers}`);
      console.log(`     - Loyal Customers: ${stats[0].loyalCustomers}`);
      console.log(`     - Lapsed Customers: ${stats[0].lapsedCustomers}`);
      console.log(`     - Seasonal Customers: ${stats[0].seasonalCustomers}`);
      console.log(`   Customer Value:`);
      console.log(`     - High Value: ${stats[0].highValue}`);
      console.log(`     - Medium Value: ${stats[0].mediumValue}`);
      console.log(`     - Low Value: ${stats[0].lowValue}`);
    }

    // Create indexes for better query performance
    console.log(`\n🔧 Creating indexes for better performance...`);
    await collection.createIndex({ 'customer_id': 1 }, { unique: true });
    await collection.createIndex({ 'segmentation.purchase_frequency': 1 });
    await collection.createIndex({ 'segmentation.spending': 1 });
    await collection.createIndex({ 'segmentation.category': 1 });
    console.log('✅ Indexes created');

    console.log('\n🎉 Import completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your backend server (Ctrl+C then npm start)');
    console.log('   2. Refresh your frontend campaign creation page');
    console.log('   3. Select customer segments and see the counts!');

  } catch (error) {
    console.error('\n❌ Error during import:', error.message);
    if (error.code === 11000) {
      console.log('💡 Duplicate key error - some customer IDs already exist');
    }
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Connection closed');
    }
  }
}

importSegmentationData();
