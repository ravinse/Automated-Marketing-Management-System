const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function checkAllDatabases() {
  let client;
  try {
    console.log('Connecting to MongoDB Atlas...\n');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected successfully\n');
    
    // List all databases
    const adminDb = client.db().admin();
    const dbList = await adminDb.listDatabases();
    
    console.log('📚 Available Databases:');
    console.log('='.repeat(50));
    
    for (const dbInfo of dbList.databases) {
      console.log(`\n🗄️  Database: ${dbInfo.name}`);
      console.log(`   Size: ${(dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2)} MB`);
      
      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      
      if (collections.length > 0) {
        console.log(`   Collections:`);
        for (const coll of collections) {
          const count = await db.collection(coll.name).countDocuments();
          console.log(`     - ${coll.name}: ${count} documents`);
          
          // If it's customer_segmentation or orders, show sample
          if ((coll.name === 'customer_segmentation' || coll.name === 'orders') && count > 0) {
            const sample = await db.collection(coll.name).findOne();
            console.log(`       Sample keys: ${Object.keys(sample).join(', ')}`);
          }
        }
      } else {
        console.log(`   (No collections)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

checkAllDatabases();
