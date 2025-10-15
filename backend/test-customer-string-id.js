const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DATABASE_NAME = process.env.SEGMENTATION_DB || 'retail_db';
const ORDERS_COLLECTION = process.env.ORDERS_COLLECTION || 'newdatabase';
const SEGMENTATION_COLLECTION = process.env.SEGMENTATION_COLLECTION || 'customer_segmentation';

async function testCustomerVariations() {
  let client;
  try {
    console.log('🔍 Searching for customer with ID containing "8000"...\n');

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(DATABASE_NAME);
    const ordersCollection = db.collection(ORDERS_COLLECTION);
    const segmentationCollection = db.collection(SEGMENTATION_COLLECTION);

    // Search for any customer IDs containing 8000
    console.log('═══════════════════════════════════════════════════════');
    console.log('1️⃣  Searching Orders Collection for IDs containing "8000"');
    console.log('═══════════════════════════════════════════════════════');
    
    const ordersWithPattern = await ordersCollection.find({
      customer_id: { $regex: /8000/i }
    }).limit(10).toArray();
    
    console.log(`Found ${ordersWithPattern.length} order(s) with customer ID containing "8000"`);
    
    if (ordersWithPattern.length > 0) {
      ordersWithPattern.forEach((order, index) => {
        console.log(`\n📦 Order ${index + 1}:`);
        console.log('  Customer ID:', order.customer_id, '(Type:', typeof order.customer_id + ')');
        console.log('  Customer Name:', order.customer_name);
        console.log('  Email:', order.email);
        console.log('  Phone:', order.phone_number);
        console.log('  Order Date:', order.order_date);
        console.log('  Category:', order.category);
      });
      
      // Test with the actual customer ID found
      const actualCustomerId = ordersWithPattern[0].customer_id;
      console.log('\n═══════════════════════════════════════════════════════');
      console.log(`2️⃣  Testing with actual ID: "${actualCustomerId}"`);
      console.log('═══════════════════════════════════════════════════════');
      
      // Check segmentation
      const segmentation = await segmentationCollection.find({ 
        customer_id: actualCustomerId 
      }).toArray();
      
      console.log(`\nSegmentation records found: ${segmentation.length}`);
      
      if (segmentation.length > 0) {
        console.log('\n🎯 Segmentation Data:');
        console.log('  Customer ID:', segmentation[0].customer_id);
        console.log('  Purchase Frequency:', segmentation[0].segmentation?.purchase_frequency);
        console.log('  Spending:', segmentation[0].segmentation?.spending);
        console.log('  Category:', segmentation[0].segmentation?.category);
      } else {
        console.log('❌ No segmentation data found');
      }
      
      // Test recent orders
      const daysPeriod = 14;
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - daysPeriod);
      
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('3️⃣  Checking Recent Orders (Last 14 Days)');
      console.log('═══════════════════════════════════════════════════════');
      console.log('Date threshold:', dateThreshold.toISOString());
      
      const recentOrders = await ordersCollection.find({
        customer_id: actualCustomerId,
        order_date: { $gte: dateThreshold }
      }).toArray();
      
      console.log(`\n${recentOrders.length > 0 ? '✅' : '❌'} Found ${recentOrders.length} order(s) in last ${daysPeriod} days`);
      
      if (recentOrders.length > 0) {
        recentOrders.forEach((order, index) => {
          console.log(`  Order ${index + 1} Date:`, order.order_date);
        });
      }
      
    } else {
      console.log('\n❌ No orders found with customer ID containing "8000"');
      
      // Show sample of what's in the database
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📋 Sample Customer IDs in Database');
      console.log('═══════════════════════════════════════════════════════');
      
      const sampleOrders = await ordersCollection.aggregate([
        { $group: { _id: "$customer_id" } },
        { $sort: { _id: -1 } },
        { $limit: 10 }
      ]).toArray();
      
      console.log('\nRecent customer IDs:');
      sampleOrders.forEach((sample, index) => {
        console.log(`  ${index + 1}. ${sample._id} (Type: ${typeof sample._id})`);
      });
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

testCustomerVariations();
