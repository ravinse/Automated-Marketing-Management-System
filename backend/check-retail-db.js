const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI;

async function checkRetailDb() {
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('retail_db');
    const collections = await db.listCollections().toArray();
    
    console.log('📁 Collections in retail_db:');
    console.log('='.repeat(60));
    
    for (const coll of collections) {
      const collection = db.collection(coll.name);
      const count = await collection.countDocuments();
      console.log(`\n📊 ${coll.name}: ${count} documents`);
      
      if (count > 0) {
        const sample = await collection.findOne();
        console.log('   Sample document:');
        console.log('   Fields:', Object.keys(sample).join(', '));
        
        // Show first few values
        const preview = {};
        Object.keys(sample).slice(0, 10).forEach(key => {
          preview[key] = sample[key];
        });
        console.log('   Preview:', JSON.stringify(preview, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) await client.close();
  }
}

checkRetailDb();
