const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DATABASE_NAME = process.env.SEGMENTATION_DB || 'retail_db';
const ORDERS_COLLECTION = process.env.ORDERS_COLLECTION || 'newdatabase';
const SEGMENTATION_COLLECTION = process.env.SEGMENTATION_COLLECTION || 'customer_segmentation';

async function testCustomer8000() {
  let client;
  try {
    console.log('🔍 Testing Customer ID 8000...\n');
    console.log('📊 Configuration:');
    console.log('  Database:', DATABASE_NAME);
    console.log('  Orders Collection:', ORDERS_COLLECTION);
    console.log('  Segmentation Collection:', SEGMENTATION_COLLECTION);
    console.log('  MongoDB URI:', MONGODB_URI.substring(0, 50) + '...\n');

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(DATABASE_NAME);
    const ordersCollection = db.collection(ORDERS_COLLECTION);
    const segmentationCollection = db.collection(SEGMENTATION_COLLECTION);

    // 1. Check if customer 8000 exists in orders (newdatabase)
    console.log('═══════════════════════════════════════════════════════');
    console.log('1️⃣  Checking Orders Collection (newdatabase)');
    console.log('═══════════════════════════════════════════════════════');
    
    const orders = await ordersCollection.find({ customer_id: 8000 }).toArray();
    console.log(`Found ${orders.length} order(s) for customer ID 8000`);
    
    if (orders.length > 0) {
      orders.forEach((order, index) => {
        console.log(`\n📦 Order ${index + 1}:`);
        console.log('  Customer ID:', order.customer_id);
        console.log('  Customer Name:', order.customer_name);
        console.log('  Email:', order.email);
        console.log('  Phone:', order.phone_number);
        console.log('  Order Date:', order.order_date);
        console.log('  Category:', order.category);
        console.log('  Gender:', order.gender);
        console.log('  Order Amount:', order.order_amount);
      });
    } else {
      console.log('❌ No orders found for customer ID 8000 in newdatabase collection');
    }

    // 2. Check if customer 8000 exists in segmentation
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('2️⃣  Checking Segmentation Collection');
    console.log('═══════════════════════════════════════════════════════');
    
    const segmentation = await segmentationCollection.find({ customer_id: 8000 }).toArray();
    console.log(`Found ${segmentation.length} segmentation record(s) for customer ID 8000`);
    
    if (segmentation.length > 0) {
      segmentation.forEach((seg, index) => {
        console.log(`\n🎯 Segmentation ${index + 1}:`);
        console.log('  Customer ID:', seg.customer_id);
        console.log('  Purchase Frequency:', seg.segmentation?.purchase_frequency);
        console.log('  Spending:', seg.segmentation?.spending);
        console.log('  Category:', seg.segmentation?.category);
      });
    } else {
      console.log('❌ No segmentation data found for customer ID 8000');
      console.log('⚠️  This customer needs to be in the segmentation collection!');
    }

    // 3. Test "New Customers" filter (last 14 days)
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('3️⃣  Testing "New Customers" Filter (Last 14 Days)');
    console.log('═══════════════════════════════════════════════════════');
    
    const daysPeriod = 14;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysPeriod);
    
    console.log('Date threshold:', dateThreshold);
    console.log('Looking for orders after:', dateThreshold.toISOString());

    const recentOrders = await ordersCollection.find({
      customer_id: 8000,
      order_date: { $gte: dateThreshold }
    }).toArray();

    console.log(`\n${recentOrders.length > 0 ? '✅' : '❌'} Customer 8000 has ${recentOrders.length} order(s) in the last ${daysPeriod} days`);
    
    if (recentOrders.length > 0) {
      recentOrders.forEach((order, index) => {
        console.log(`  Order ${index + 1} Date:`, order.order_date);
      });
    }

    // 4. Test the actual segmentation query
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('4️⃣  Testing Complete Segmentation Query');
    console.log('═══════════════════════════════════════════════════════');
    
    // Get all customers with orders in last 14 days
    const allRecentOrders = await ordersCollection.aggregate([
      {
        $match: {
          order_date: { $gte: dateThreshold }
        }
      },
      {
        $group: {
          _id: "$customer_id"
        }
      }
    ]).toArray();
    
    const recentCustomerIds = allRecentOrders.map(order => order._id);
    console.log(`Total customers with orders in last ${daysPeriod} days: ${recentCustomerIds.length}`);
    console.log(`Customer 8000 in recent list: ${recentCustomerIds.includes(8000) ? '✅ YES' : '❌ NO'}`);

    // Now check if customer 8000 is in segmentation AND in recent orders
    const finalQuery = {
      $and: [
        { 'segmentation.purchase_frequency': 'New' },
        { customer_id: { $in: recentCustomerIds } }
      ]
    };
    
    console.log('\nFinal query:', JSON.stringify(finalQuery, null, 2));
    
    const matchedCustomers = await segmentationCollection.find(finalQuery).toArray();
    console.log(`\nCustomers matching "New Customers" criteria: ${matchedCustomers.length}`);
    
    const customer8000Matched = matchedCustomers.find(c => c.customer_id === 8000);
    if (customer8000Matched) {
      console.log('✅ Customer 8000 WOULD BE INCLUDED in "New Customers" segment');
    } else {
      console.log('❌ Customer 8000 WOULD NOT BE INCLUDED in "New Customers" segment');
      console.log('\n🔍 Possible reasons:');
      console.log('   1. Customer 8000 not in segmentation collection');
      console.log('   2. purchase_frequency is not set to "New"');
      console.log('   3. Order date is outside the 14-day window');
    }

    // 5. Show all data for debugging
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('5️⃣  Summary & Recommendations');
    console.log('═══════════════════════════════════════════════════════');
    
    console.log('\n📋 Checklist:');
    console.log(`  ${orders.length > 0 ? '✅' : '❌'} Customer 8000 exists in orders (newdatabase)`);
    console.log(`  ${segmentation.length > 0 ? '✅' : '❌'} Customer 8000 exists in segmentation`);
    console.log(`  ${recentOrders.length > 0 ? '✅' : '❌'} Customer 8000 has recent orders (last ${daysPeriod} days)`);
    console.log(`  ${segmentation.length > 0 && segmentation[0]?.segmentation?.purchase_frequency === 'New' ? '✅' : '❌'} Customer 8000 marked as "New" in segmentation`);

    if (orders.length > 0 && segmentation.length === 0) {
      console.log('\n⚠️  ISSUE FOUND: Customer 8000 has orders but no segmentation data!');
      console.log('💡 Solution: You need to add customer 8000 to the customer_segmentation collection');
      console.log('\n📝 Sample document to add:');
      console.log(JSON.stringify({
        customer_id: 8000,
        segmentation: {
          purchase_frequency: 'New',
          spending: 'Medium Value',  // or Low/High Value Customer
          category: 'Mens'  // or Womens/Kids/Family based on order
        }
      }, null, 2));
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

testCustomer8000();
