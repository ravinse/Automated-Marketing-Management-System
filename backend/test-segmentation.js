const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI;
const DATABASE_NAME = 'retail_db';
const COLLECTION_NAME = 'customer_segmentation';
const ORDERS_COLLECTION = 'newdatabase';

const SEGMENT_MAPPING = {
  'New Customers': { field: 'purchase_frequency', value: 'New' },
  'Loyal Customers': { field: 'purchase_frequency', value: 'Loyal' },
  'Lapsed Customers': { field: 'purchase_frequency', value: 'Lapsed' },
  'Seasonal Customers': { field: 'purchase_frequency', value: 'Seasonal' },
  'High value customers': { field: 'spending', value: 'High Value Customer' },
  'Low value customers': { field: 'spending', value: 'Low Value Customer' },
  'Medium Value': { field: 'spending', value: 'Medium Value' },
  'Women': { field: 'category', value: 'Womens' },
  'Men': { field: 'category', value: 'Mens' },
  'Kids': { field: 'category', value: 'Kids' },
  'Family': { field: 'category', value: 'Family' }
};

async function testSegmentation() {
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const ordersCollection = db.collection(ORDERS_COLLECTION);
    
    console.log('Testing different segment queries:\n');
    console.log('='.repeat(60));
    
    // Test 1: Lapsed Customers
    console.log('\n1️⃣  Testing "Lapsed Customers":');
    const mapping = SEGMENT_MAPPING['Lapsed Customers'];
    const fieldPath = `segmentation.${mapping.field}`;
    const query1 = { [fieldPath]: mapping.value };
    const count1 = await collection.countDocuments(query1);
    console.log(`   Query: ${JSON.stringify(query1)}`);
    console.log(`   Result: ${count1} customers`);
    
    // Test 2: Medium Value
    console.log('\n2️⃣  Testing "Medium Value":');
    const mapping2 = SEGMENT_MAPPING['Medium Value'];
    const fieldPath2 = `segmentation.${mapping2.field}`;
    const query2 = { [fieldPath2]: mapping2.value };
    const count2 = await collection.countDocuments(query2);
    console.log(`   Query: ${JSON.stringify(query2)}`);
    console.log(`   Result: ${count2} customers`);
    
    // Test 3: Men category
    console.log('\n3️⃣  Testing "Men" category:');
    const mapping3 = SEGMENT_MAPPING['Men'];
    const fieldPath3 = `segmentation.${mapping3.field}`;
    const query3 = { [fieldPath3]: mapping3.value };
    const count3 = await collection.countDocuments(query3);
    console.log(`   Query: ${JSON.stringify(query3)}`);
    console.log(`   Result: ${count3} customers`);
    
    // Test 4: Check orders collection
    console.log('\n4️⃣  Checking orders collection:');
    const ordersCount = await ordersCollection.countDocuments();
    console.log(`   Total orders: ${ordersCount}`);
    
    const recentOrder = await ordersCollection.findOne({}, { sort: { order_date: -1 } });
    if (recentOrder) {
      console.log(`   Most recent order date: ${recentOrder.order_date}`);
    }
    
    // Test 5: Check orders from last 365 days
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 365);
    const recentOrdersCount = await ordersCollection.countDocuments({
      order_date: { $gte: dateThreshold }
    });
    console.log(`   Orders in last 365 days: ${recentOrdersCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    if (client) await client.close();
  }
}

testSegmentation();
