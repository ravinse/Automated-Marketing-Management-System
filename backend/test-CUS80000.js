const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const DATABASE_NAME = process.env.SEGMENTATION_DB || 'retail_db';
const ORDERS_COLLECTION = process.env.ORDERS_COLLECTION || 'newdatabase';
const SEGMENTATION_COLLECTION = process.env.SEGMENTATION_COLLECTION || 'customer_segmentation';

async function testCUS80000() {
  let client;
  try {
    console.log('🔍 Testing Customer CUS80000 (Your new customer)...\n');

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(DATABASE_NAME);
    const ordersCollection = db.collection(ORDERS_COLLECTION);
    const segmentationCollection = db.collection(SEGMENTATION_COLLECTION);

    const customerId = 'CUS80000';

    // 1. Check orders
    console.log('═══════════════════════════════════════════════════════');
    console.log('1️⃣  Orders for CUS80000');
    console.log('═══════════════════════════════════════════════════════');
    
    const orders = await ordersCollection.find({ customer_id: customerId }).toArray();
    console.log(`Found ${orders.length} order(s)\n`);
    
    orders.forEach((order, index) => {
      console.log(`📦 Order ${index + 1}:`);
      console.log('  Customer ID:', order.customer_id);
      console.log('  Customer Name:', order.customer_name);
      console.log('  Email:', order.email);
      console.log('  Phone:', order.phone_number);
      console.log('  Order Date:', order.order_date);
      console.log('  Order Amount:', order.order_amount);
      console.log('  Gender:', order.gender);
      console.log('  Full order data:', JSON.stringify(order, null, 2));
    });

    // 2. Check segmentation
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('2️⃣  Segmentation for CUS80000');
    console.log('═══════════════════════════════════════════════════════');
    
    const segmentation = await segmentationCollection.find({ customer_id: customerId }).toArray();
    console.log(`Found ${segmentation.length} segmentation record(s)\n`);
    
    if (segmentation.length > 0) {
      console.log('✅ Segmentation exists!');
      console.log(JSON.stringify(segmentation[0], null, 2));
    } else {
      console.log('❌ NO SEGMENTATION DATA - This is the problem!\n');
      console.log('💡 SOLUTION: Add this customer to the segmentation collection');
      
      // Generate sample segmentation document
      const sampleSegmentation = {
        customer_id: customerId,
        segmentation: {
          purchase_frequency: 'New',  // Since this is a recent order
          spending: 'Medium Value',   // Adjust based on order_amount
          category: orders[0]?.gender === 'Male' ? 'Mens' : orders[0]?.gender === 'Female' ? 'Womens' : 'Family'
        }
      };
      
      console.log('\n📝 Sample document to add to customer_segmentation collection:');
      console.log(JSON.stringify(sampleSegmentation, null, 2));
      
      console.log('\n📋 You can add this via MongoDB Atlas:');
      console.log('   1. Go to MongoDB Atlas');
      console.log('   2. Navigate to retail_db > customer_segmentation');
      console.log('   3. Click "Insert Document"');
      console.log('   4. Paste the JSON above');
    }

    // 3. Test if it would appear in "New Customers" filter
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('3️⃣  Would CUS80000 appear in "New Customers"?');
    console.log('═══════════════════════════════════════════════════════');
    
    const daysPeriod = 14;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysPeriod);
    
    console.log('Date threshold:', dateThreshold.toISOString());
    
    const recentOrders = await ordersCollection.find({
      customer_id: customerId,
      order_date: { $gte: dateThreshold }
    }).toArray();
    
    console.log(`\n${recentOrders.length > 0 ? '✅' : '❌'} Has orders in last ${daysPeriod} days: ${recentOrders.length > 0 ? 'YES' : 'NO'}`);
    console.log(`${segmentation.length > 0 ? '✅' : '❌'} Has segmentation data: ${segmentation.length > 0 ? 'YES' : 'NO'}`);
    console.log(`${segmentation.length > 0 && segmentation[0]?.segmentation?.purchase_frequency === 'New' ? '✅' : '❌'} Marked as "New": ${segmentation.length > 0 && segmentation[0]?.segmentation?.purchase_frequency === 'New' ? 'YES' : 'NO'}`);
    
    console.log('\n' + '═'.repeat(55));
    console.log('📊 DIAGNOSIS');
    console.log('═'.repeat(55));
    
    if (orders.length > 0 && segmentation.length === 0) {
      console.log('\n🔴 PROBLEM IDENTIFIED:');
      console.log('   Customer CUS80000 exists in orders (newdatabase)');
      console.log('   BUT is missing from customer_segmentation collection!');
      console.log('\n💡 WHY IT DOESN\'T SHOW IN CAMPAIGNS:');
      console.log('   The segmentation query requires BOTH:');
      console.log('   1. Recent order in newdatabase ✅');
      console.log('   2. Entry in customer_segmentation ❌ MISSING');
      console.log('\n✅ FIX: Add the customer to customer_segmentation collection');
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

testCUS80000();
