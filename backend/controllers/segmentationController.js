const { MongoClient } = require('mongodb');

// MongoDB connection for segmented data
// Use MONGO_URI or MONGODB_URI from environment variables
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.SEGMENTATION_DB || 'retail_db';
const COLLECTION_NAME = process.env.SEGMENTATION_COLLECTION || 'customer_segmentation';
const ORDERS_COLLECTION = process.env.ORDERS_COLLECTION || 'newdatabase'; // Orders collection for date filtering

// Mapping between UI labels and database values
const SEGMENT_MAPPING = {
  // Shopping Frequency mappings
  'New Customers': { field: 'purchase_frequency', value: 'New' },
  'Loyal Customers': { field: 'purchase_frequency', value: 'Loyal' },
  'Lapsed Customers': { field: 'purchase_frequency', value: 'Lapsed' },
  'Seasonal Customers': { field: 'purchase_frequency', value: 'Seasonal' },
  
  // Customer Value mappings
  'High value customers': { field: 'spending', value: 'High Value Customer' },
  'Low value customers': { field: 'spending', value: 'Low Value Customer' },
  'Medium Value': { field: 'spending', value: 'Medium Value' },
  
  // Product Preference mappings
  'Women': { field: 'category', value: 'Womens' },
  'Men': { field: 'category', value: 'Mens' },
  'Kids': { field: 'category', value: 'Kids' },
  'Family': { field: 'category', value: 'Family' }
};

// Get all available segments with counts
exports.getAvailableSegments = async (req, res) => {
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Aggregate to get counts for each segment type
    const pipeline = [
      {
        $facet: {
          purchaseFrequency: [
            { $group: { _id: "$segmentation.purchase_frequency", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          spending: [
            { $group: { _id: "$segmentation.spending", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          category: [
            { $group: { _id: "$segmentation.category", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    
    res.json({
      success: true,
      segments: result[0]
    });
  } catch (error) {
    console.error('Error fetching available segments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching available segments', 
      error: error.message 
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

// Get filtered customers based on selected segments
exports.getFilteredCustomers = async (req, res) => {
  let client;
  try {
    const { customerSegments, daysPeriod = 14 } = req.body; // Default to 14 days

    if (!customerSegments || customerSegments.length === 0) {
      return res.json({
        success: true,
        customers: [],
        count: 0,
        message: 'No segments selected'
      });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const ordersCollection = db.collection(ORDERS_COLLECTION);

    // Build query based on selected segments
    const filters = {};
    
    // Calculate date threshold for "New Customers" based on daysPeriod
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysPeriod);
    
    customerSegments.forEach(segment => {
      const mapping = SEGMENT_MAPPING[segment];
      if (mapping) {
        const fieldPath = `segmentation.${mapping.field}`;
        if (!filters[fieldPath]) {
          filters[fieldPath] = { $in: [] };
        }
        filters[fieldPath].$in.push(mapping.value);
      }
    });

    let queryConditions = Object.entries(filters).map(([field, condition]) => ({ [field]: condition }));
    
    // Add date filter for "New Customers" if selected
    const hasNewCustomers = customerSegments.includes('New Customers');
    
    let customers = [];
    
    if (hasNewCustomers && daysPeriod) {
      // Get customer IDs with recent orders (within daysPeriod)
      const recentOrders = await ordersCollection.aggregate([
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
      
      const recentCustomerIds = recentOrders.map(order => order._id);
      console.log(`Found ${recentCustomerIds.length} customers with orders in last ${daysPeriod} days`);
      
      // Add customer_id filter to query conditions
      queryConditions.push({
        customer_id: { $in: recentCustomerIds }
      });
    }

    // Convert to $and query for multiple filters (intersection)
    const query = queryConditions.length > 0 
      ? { $and: queryConditions }
      : {};

    console.log('MongoDB Query:', JSON.stringify(query, null, 2));
    console.log('Date threshold for new customers:', dateThreshold);

    customers = await collection.find(query).toArray();
    
    // Enrich customer data with email and phone from orders collection
    if (customers.length > 0) {
      const customerIds = customers.map(c => c.customer_id);
      const customerOrders = await ordersCollection.aggregate([
        {
          $match: { customer_id: { $in: customerIds } }
        },
        {
          $group: {
            _id: "$customer_id",
            customer_name: { $first: "$customer_name" },
            email: { $first: "$email" },
            phone_number: { $first: "$phone_number" },
            gender: { $first: "$gender" },
            last_order_date: { $max: "$order_date" },
            total_orders: { $sum: 1 }
          }
        }
      ]).toArray();
      
      // Merge order data with customer segmentation data
      const orderDataMap = {};
      customerOrders.forEach(order => {
        orderDataMap[order._id] = order;
      });
      
      customers = customers.map(customer => ({
        ...customer,
        customer_name: orderDataMap[customer.customer_id]?.customer_name || '',
        email: orderDataMap[customer.customer_id]?.email || '',
        phone_number: orderDataMap[customer.customer_id]?.phone_number || '',
        gender: orderDataMap[customer.customer_id]?.gender || '',
        last_order_date: orderDataMap[customer.customer_id]?.last_order_date || null,
        total_orders: orderDataMap[customer.customer_id]?.total_orders || 0
      }));
    }

    res.json({
      success: true,
      customers: customers,
      count: customers.length,
      query: query,
      daysPeriod: daysPeriod
    });
  } catch (error) {
    console.error('Error fetching filtered customers:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching filtered customers', 
      error: error.message 
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

// Get customer details by IDs (for campaign targeting)
exports.getCustomersByIds = async (req, res) => {
  let client;
  try {
    const { customerIds } = req.body;

    if (!customerIds || customerIds.length === 0) {
      return res.json({
        success: true,
        customers: [],
        count: 0
      });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const customers = await collection.find({
      customer_id: { $in: customerIds }
    }).toArray();

    res.json({
      success: true,
      customers: customers,
      count: customers.length
    });
  } catch (error) {
    console.error('Error fetching customers by IDs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching customers by IDs', 
      error: error.message 
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

// Preview customer count for selected segments (without fetching all data)
exports.previewCustomerCount = async (req, res) => {
  let client;
  try {
    const { customerSegments, daysPeriod = 14 } = req.body; // Default to 14 days

    if (!customerSegments || customerSegments.length === 0) {
      return res.json({
        success: true,
        count: 0,
        breakdown: {},
        message: 'No segments selected'
      });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const ordersCollection = db.collection(ORDERS_COLLECTION);

    // Build query based on selected segments
    const filters = {};
    
    // Calculate date threshold for "New Customers" based on daysPeriod
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysPeriod);
    
    customerSegments.forEach(segment => {
      const mapping = SEGMENT_MAPPING[segment];
      if (mapping) {
        const fieldPath = `segmentation.${mapping.field}`;
        if (!filters[fieldPath]) {
          filters[fieldPath] = { $in: [] };
        }
        filters[fieldPath].$in.push(mapping.value);
      }
    });

    let queryConditions = Object.entries(filters).map(([field, condition]) => ({ [field]: condition }));
    
    // Add date filter for "New Customers" if selected
    const hasNewCustomers = customerSegments.includes('New Customers');
    let recentCustomerIds = [];
    
    if (hasNewCustomers && daysPeriod) {
      // Get customer IDs with recent orders (within daysPeriod)
      const recentOrders = await ordersCollection.aggregate([
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
      
      recentCustomerIds = recentOrders.map(order => order._id);
      console.log(`Found ${recentCustomerIds.length} customers with orders in last ${daysPeriod} days`);
      
      // Add customer_id filter to query conditions
      queryConditions.push({
        customer_id: { $in: recentCustomerIds }
      });
    }

    // Convert to $and query for multiple filters (intersection)
    const query = queryConditions.length > 0 
      ? { $and: queryConditions }
      : {};

    const count = await collection.countDocuments(query);

    // Get breakdown by each segment type
    const breakdown = {};
    for (const segment of customerSegments) {
      const mapping = SEGMENT_MAPPING[segment];
      if (mapping) {
        const fieldPath = `segmentation.${mapping.field}`;
        let segmentQuery = { [fieldPath]: mapping.value };
        
        // Add date filter for "New Customers"
        if (segment === 'New Customers' && daysPeriod && recentCustomerIds.length > 0) {
          segmentQuery = {
            $and: [
              { [fieldPath]: mapping.value },
              { customer_id: { $in: recentCustomerIds } }
            ]
          };
        }
        
        const segmentCount = await collection.countDocuments(segmentQuery);
        breakdown[segment] = segmentCount;
      }
    }

    res.json({
      success: true,
      count: count,
      breakdown: breakdown,
      query: query,
      daysPeriod: daysPeriod
    });
  } catch (error) {
    console.error('Error previewing customer count:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error previewing customer count', 
      error: error.message 
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

// Get segmentation statistics
exports.getSegmentationStats = async (req, res) => {
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const totalCustomers = await collection.countDocuments();

    const stats = {
      totalCustomers,
      byFrequency: {},
      bySpending: {},
      byCategory: {}
    };

    // Get frequency distribution
    const frequencyStats = await collection.aggregate([
      { $group: { _id: "$segmentation.purchase_frequency", count: { $sum: 1 } } }
    ]).toArray();
    frequencyStats.forEach(item => {
      stats.byFrequency[item._id] = item.count;
    });

    // Get spending distribution
    const spendingStats = await collection.aggregate([
      { $group: { _id: "$segmentation.spending", count: { $sum: 1 } } }
    ]).toArray();
    spendingStats.forEach(item => {
      stats.bySpending[item._id] = item.count;
    });

    // Get category distribution
    const categoryStats = await collection.aggregate([
      { $group: { _id: "$segmentation.category", count: { $sum: 1 } } }
    ]).toArray();
    categoryStats.forEach(item => {
      stats.byCategory[item._id] = item.count;
    });

    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error fetching segmentation stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching segmentation stats', 
      error: error.message 
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
};
