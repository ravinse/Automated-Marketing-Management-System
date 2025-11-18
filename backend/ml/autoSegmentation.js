// MongoDB client for database operations
const { MongoClient } = require('mongodb');
require('dotenv').config();

// ========================================
// DATABASE CONFIGURATION
// ========================================
// MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
// Database name for retail operations
const DATABASE_NAME = process.env.SEGMENTATION_DB || 'retail_db';
// Collection containing customer orders
const ORDERS_COLLECTION = process.env.ORDERS_COLLECTION || 'newdatabase';
// Collection for storing customer segmentation data
const SEGMENTATION_COLLECTION = process.env.SEGMENTATION_COLLECTION || 'customer_segmentation';

/**
 * ML-Based Auto-Segmentation Logic
 * Automatically segments customers based on their order data using ML algorithms
 */

// ========================================
// PURCHASE FREQUENCY CLASSIFIER
// ========================================
// Analyzes order history to classify customers into: New, Loyal, Lapsed, or Seasonal
function determinePurchaseFrequency(orders, customerOrders) {
  if (!customerOrders || customerOrders.length === 0) {
    return 'New';
  }

  const now = new Date();
  const daysSinceLastOrder = (now - new Date(customerOrders[0].order_date)) / (1000 * 60 * 60 * 24);
  const totalOrders = customerOrders.length;
  
  // Check order dates to determine pattern
  const orderDates = customerOrders.map(o => new Date(o.order_date)).sort((a, b) => b - a);
  const oldestOrder = orderDates[orderDates.length - 1];
  const daysSinceFirstOrder = (now - oldestOrder) / (1000 * 60 * 60 * 24);
  
  if (totalOrders === 1 && daysSinceLastOrder <= 30) {
    return 'New'; // First order within 30 days
  } else if (daysSinceLastOrder > 180) {
    return 'Lapsed'; // No orders in last 6 months
  } else if (totalOrders >= 5 && daysSinceFirstOrder > 90) {
    return 'Loyal'; // 5+ orders over more than 3 months
  } else {
    // Check if orders are seasonal (concentrated in certain months)
    const orderMonths = orderDates.map(d => d.getMonth());
    const uniqueMonths = [...new Set(orderMonths)];
    if (uniqueMonths.length <= 3 && totalOrders >= 3) {
      return 'Seasonal';
    }
    return 'New'; // Default for customers who don't fit other categories
  }
}

// ========================================
// SPENDING LEVEL CLASSIFIER
// ========================================
// Calculates total and average spending to classify as: High Value, Medium Value, or Low Value
function determineSpendingLevel(orders, customerOrders) {
  if (!customerOrders || customerOrders.length === 0) {
    return 'Low Value Customer';
  }

  // Calculate total spending across all orders
  const totalSpending = customerOrders.reduce((sum, order) => {
    return sum + (order.total_amount_lkr || order.order_amount || order.price_lkr || 0);
  }, 0);

  const averageOrderValue = totalSpending / customerOrders.length;

  // Thresholds (in LKR)
  const HIGH_VALUE_THRESHOLD = 50000; // 50k total or 20k average
  const HIGH_AVG_THRESHOLD = 20000;
  const LOW_VALUE_THRESHOLD = 10000;  // 10k total or 3k average
  const LOW_AVG_THRESHOLD = 3000;

  if (totalSpending >= HIGH_VALUE_THRESHOLD || averageOrderValue >= HIGH_AVG_THRESHOLD) {
    return 'High Value Customer';
  } else if (totalSpending >= LOW_VALUE_THRESHOLD || averageOrderValue >= LOW_AVG_THRESHOLD) {
    return 'Medium Value';
  } else {
    return 'Low Value Customer';
  }
}

// ========================================
// CATEGORY PREFERENCE CLASSIFIER
// ========================================
// Analyzes purchase patterns to identify preferred category: Mens, Womens, Kids, or Family
function determineCategoryPreference(orders, customerOrders) {
  if (!customerOrders || customerOrders.length === 0) {
    return 'Family';
  }

  // Count orders by product category
  const categoryCounts = {};
  
  customerOrders.forEach(order => {
    // Check multiple possible category fields
    let category = order.product_category || order.category || order.clothing_category;
    
    // Also check gender field
    if (!category && order.gender) {
      if (order.gender.toLowerCase() === 'male') category = 'Men';
      else if (order.gender.toLowerCase() === 'female') category = 'Women';
    }
    
    if (category) {
      // Normalize category names
      const normalizedCategory = category.toLowerCase();
      if (normalizedCategory.includes('men') || normalizedCategory.includes('male')) {
        categoryCounts['Mens'] = (categoryCounts['Mens'] || 0) + 1;
      } else if (normalizedCategory.includes('women') || normalizedCategory.includes('female')) {
        categoryCounts['Womens'] = (categoryCounts['Womens'] || 0) + 1;
      } else if (normalizedCategory.includes('kid') || normalizedCategory.includes('child')) {
        categoryCounts['Kids'] = (categoryCounts['Kids'] || 0) + 1;
      } else {
        categoryCounts['Family'] = (categoryCounts['Family'] || 0) + 1;
      }
    }
  });

  // If customer buys from multiple categories, mark as Family
  const categories = Object.keys(categoryCounts);
  if (categories.length > 2) {
    return 'Family';
  }

  // Return the most frequent category
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  return topCategory ? topCategory[0] : 'Family';
}

// ========================================
// MAIN SEGMENTATION SYNC FUNCTION
// ========================================
/**
 * Sync new customers from orders to segmentation
 * Steps:
 * 1. Connect to MongoDB and fetch all unique customers from orders
 * 2. Check which customers already have segmentation data
 * 3. Identify new customers that need segmentation
 * 4. Apply ML algorithms to classify each customer
 * 5. Store segmentation results in database
 */
async function syncNewCustomers() {
  let client;
  try {
    console.log('🔄 [ML-Segmentation] Starting auto-segmentation sync...\n');
    console.log('📊 Configuration:');
    console.log('  Database:', DATABASE_NAME);
    console.log('  Orders Collection:', ORDERS_COLLECTION);
    console.log('  Segmentation Collection:', SEGMENTATION_COLLECTION);
    console.log();

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(DATABASE_NAME);
    const ordersCollection = db.collection(ORDERS_COLLECTION);
    const segmentationCollection = db.collection(SEGMENTATION_COLLECTION);

    // Get all unique customer IDs from orders
    console.log('📋 Step 1: Getting all customers from orders...');
    const allCustomerIds = await ordersCollection.distinct('customer_id');
    console.log(`   Found ${allCustomerIds.length} unique customers in orders\n`);

    // Get existing customer IDs in segmentation
    console.log('📋 Step 2: Getting existing segmentation data...');
    const existingCustomerIds = await segmentationCollection.distinct('customer_id');
    console.log(`   Found ${existingCustomerIds.length} customers already segmented\n`);

    // Find new customers that need segmentation
    const newCustomerIds = allCustomerIds.filter(id => !existingCustomerIds.includes(id));
    console.log('📋 Step 3: Identifying new customers...');
    console.log(`   Found ${newCustomerIds.length} new customers to segment\n`);

    if (newCustomerIds.length === 0) {
      console.log('✅ All customers are already segmented! No action needed.');
      return { added: 0, skipped: 0, total: allCustomerIds.length };
    }

    // ========================================
    // CUSTOMER PROCESSING LOOP
    // ========================================
    // Apply ML segmentation to each new customer
    console.log('📋 Step 4: Segmenting new customers...\n');
    const segmentationDocuments = [];

    for (const customerId of newCustomerIds) {
      console.log(`   Processing customer: ${customerId}`);
      
      // Fetch all orders for this customer (sorted by most recent first)
      const customerOrders = await ordersCollection.find({ 
        customer_id: customerId 
      }).sort({ order_date: -1 }).toArray();

      if (customerOrders.length === 0) {
        console.log(`   ⚠️  No orders found for ${customerId}, skipping...`);
        continue;
      }

      // Apply ML classification algorithms to determine customer segments
      const purchaseFrequency = determinePurchaseFrequency(ordersCollection, customerOrders);
      const spending = determineSpendingLevel(ordersCollection, customerOrders);
      const category = determineCategoryPreference(ordersCollection, customerOrders);

      // Create segmentation document with classification results
      const segmentationDoc = {
        customer_id: customerId,
        segmentation: {
          purchase_frequency: purchaseFrequency,
          spending: spending,
          category: category
        },
        created_at: new Date(),
        last_updated: new Date()
      };

      segmentationDocuments.push(segmentationDoc);

      console.log(`   ✅ ${customerId}: ${purchaseFrequency} | ${spending} | ${category}`);
    }

    // ========================================
    // DATABASE INSERTION
    // ========================================
    // Insert all segmentation documents into MongoDB with duplicate handling
    let insertedCount = 0;
    let duplicateCount = 0;
    
    if (segmentationDocuments.length > 0) {
      console.log(`\n📋 Step 5: Inserting ${segmentationDocuments.length} new segmentation records...`);
      
      try {
        // Bulk insert with ordered:false to continue even if some records already exist
        const result = await segmentationCollection.insertMany(segmentationDocuments, { ordered: false });
        insertedCount = result.insertedCount;
        console.log(`   ✅ Successfully inserted ${insertedCount} records`);
      } catch (error) {
        // Handle duplicate key errors gracefully
        if (error.code === 11000) {
          // Extract number of successful insertions from bulk write error
          insertedCount = error.result?.insertedCount || 0;
          duplicateCount = segmentationDocuments.length - insertedCount;
          
          console.log(`   ✅ Successfully inserted ${insertedCount} records`);
          console.log(`   ⚠️  Skipped ${duplicateCount} duplicate(s) (already exists)`);
        } else {
          // Re-throw if it's not a duplicate key error
          throw error;
        }
      }
      console.log();
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 ML SEGMENTATION SYNC SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Total customers in orders:        ${allCustomerIds.length}`);
    console.log(`Previously segmented:             ${existingCustomerIds.length}`);
    console.log(`Newly processed:                  ${segmentationDocuments.length}`);
    console.log(`Successfully inserted:            ${insertedCount}`);
    if (duplicateCount > 0) {
      console.log(`Duplicates skipped:               ${duplicateCount}`);
    }
    console.log(`Now fully synced:                 ${existingCustomerIds.length + insertedCount}`);
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('✅ ML auto-segmentation complete!\n');

    return {
      added: insertedCount,
      skipped: (newCustomerIds.length - segmentationDocuments.length) + duplicateCount,
      total: allCustomerIds.length,
      duplicates: duplicateCount
    };

  } catch (error) {
    console.error('❌ [ML-Segmentation] Error during sync:', error.message);
    console.error(error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the sync
if (require.main === module) {
  syncNewCustomers()
    .then(() => {
      console.log('\n🎉 ML Segmentation process completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 ML Segmentation process failed:', error.message);
      process.exit(1);
    });
}

module.exports = { syncNewCustomers };
