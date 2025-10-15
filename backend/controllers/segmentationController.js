const { MongoClient } = require('mongodb');

// MongoDB connection for segmented data
// Use MONGO_URI or MONGODB_URI from environment variables
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.SEGMENTATION_DB || 'retail_db';
const COLLECTION_NAME = process.env.SEGMENTATION_COLLECTION || 'customer_segmentation';

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
    const { customerSegments } = req.body;

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

    // Build query based on selected segments
    const filters = {};
    
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

    // Convert to $and query for multiple filters (intersection)
    const query = Object.keys(filters).length > 0 
      ? { $and: Object.entries(filters).map(([field, condition]) => ({ [field]: condition })) }
      : {};

    console.log('MongoDB Query:', JSON.stringify(query, null, 2));

    const customers = await collection.find(query).toArray();

    res.json({
      success: true,
      customers: customers,
      count: customers.length,
      query: query
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
    const { customerSegments } = req.body;

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

    // Build query based on selected segments
    const filters = {};
    
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

    // Convert to $and query for multiple filters (intersection)
    const query = Object.keys(filters).length > 0 
      ? { $and: Object.entries(filters).map(([field, condition]) => ({ [field]: condition })) }
      : {};

    const count = await collection.countDocuments(query);

    // Get breakdown by each segment type
    const breakdown = {};
    for (const segment of customerSegments) {
      const mapping = SEGMENT_MAPPING[segment];
      if (mapping) {
        const fieldPath = `segmentation.${mapping.field}`;
        const segmentCount = await collection.countDocuments({
          [fieldPath]: mapping.value
        });
        breakdown[segment] = segmentCount;
      }
    }

    res.json({
      success: true,
      count: count,
      breakdown: breakdown,
      query: query
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
