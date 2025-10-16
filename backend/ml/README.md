# ML (Machine Learning) Section

This directory contains the ML-based customer segmentation system for the Automated Marketing Management System.

## Overview

The ML section implements intelligent customer segmentation using machine learning algorithms to automatically categorize customers based on their purchasing behavior, spending patterns, and product preferences.

## Structure

```
ml/
├── segmentationController.js  # API endpoints for ML segmentation
├── autoSegmentation.js        # ML algorithms for customer segmentation
├── segmentationScheduler.js   # Automated scheduler for periodic segmentation
└── README.md                  # This file
```

## Components

### 1. segmentationController.js
**Purpose**: Handles HTTP requests for ML-based customer segmentation

**Endpoints**:
- `GET /api/ml/segmentation/available-segments` - Get all available customer segments with counts
- `POST /api/ml/segmentation/filtered-customers` - Get filtered customers based on selected segments
- `POST /api/ml/segmentation/customers-by-ids` - Get customer details by IDs
- `POST /api/ml/segmentation/preview-count` - Preview customer count for selected segments
- `GET /api/ml/segmentation/stats` - Get overall segmentation statistics

### 2. autoSegmentation.js
**Purpose**: Core ML segmentation logic that analyzes customer behavior

**Segmentation Categories**:

#### Purchase Frequency
- **New**: First order within 30 days
- **Loyal**: 5+ orders over 3+ months
- **Lapsed**: No orders in last 6 months
- **Seasonal**: Orders concentrated in specific months

#### Spending Level
- **High Value Customer**: 50k+ LKR total OR 20k+ average order
- **Medium Value**: 10k-50k LKR total OR 3k-20k average order
- **Low Value Customer**: < 10k LKR total AND < 3k average order

#### Product Category Preference
- **Men**: Primarily men's products
- **Women**: Primarily women's products
- **Kids**: Primarily kids' products
- **Family**: Multiple categories (2+)

### 3. segmentationScheduler.js
**Purpose**: Automatically runs ML segmentation on new customers

**Features**:
- Runs every 1 minute by default (configurable)
- Prevents concurrent runs
- Provides detailed logging
- Manual trigger support

## API Usage

### Get Available Segments
```javascript
GET /api/ml/segmentation/available-segments

Response:
{
  "success": true,
  "segments": {
    "purchaseFrequency": [
      { "_id": "New", "count": 150 },
      { "_id": "Loyal", "count": 45 },
      { "_id": "Lapsed", "count": 30 },
      { "_id": "Seasonal", "count": 25 }
    ],
    "spending": [
      { "_id": "High Value Customer", "count": 50 },
      { "_id": "Medium Value", "count": 100 },
      { "_id": "Low Value Customer", "count": 100 }
    ],
    "category": [
      { "_id": "Women", "count": 120 },
      { "_id": "Men", "count": 80 },
      { "_id": "Kids", "count": 30 },
      { "_id": "Family", "count": 20 }
    ]
  }
}
```

### Get Filtered Customers
```javascript
POST /api/ml/segmentation/filtered-customers
Content-Type: application/json

{
  "customerSegments": ["Loyal Customers", "High value customers"],
  "daysPeriod": 14
}

Response:
{
  "success": true,
  "customers": [
    {
      "customer_id": "C001",
      "customer_name": "John Doe",
      "email": "john@example.com",
      "phone_number": "0771234567",
      "segmentation": {
        "purchase_frequency": "Loyal",
        "spending": "High Value Customer",
        "category": "Mens"
      },
      "total_orders": 8,
      "last_order_date": "2025-10-10T00:00:00.000Z"
    }
  ],
  "count": 25,
  "daysPeriod": 14
}
```

### Manual Sync Trigger
```javascript
POST /api/ml/segmentation/sync

Response:
{
  "success": true,
  "message": "ML segmentation sync completed successfully"
}
```

## Configuration

### Environment Variables
```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017
MONGODB_URI=mongodb://localhost:27017
SEGMENTATION_DB=retail_db
SEGMENTATION_COLLECTION=customer_segmentation
ORDERS_COLLECTION=newdatabase

# Scheduler Configuration
ENABLE_SCHEDULERS=true  # Set to false to disable automatic scheduling
```

### Scheduler Configuration
Edit `segmentationScheduler.js` to change the schedule:

```javascript
// Default: Every 1 minute
startSegmentationScheduler('*/1 * * * *');

// Examples:
// Every 5 minutes: '*/5 * * * *'
// Every 30 minutes: '*/30 * * * *'
// Every hour: '0 * * * *'
// Every 2 hours: '0 */2 * * *'
// Daily at midnight: '0 0 * * *'
```

## ML Algorithm Details

### Purchase Frequency Algorithm
1. Analyzes order history timeline
2. Calculates days since last order
3. Evaluates order frequency pattern
4. Checks for seasonal patterns
5. Assigns appropriate segment

### Spending Level Algorithm
1. Calculates total spending across all orders
2. Computes average order value
3. Applies threshold-based classification
4. Considers both total and average metrics

### Category Preference Algorithm
1. Analyzes product categories in all orders
2. Checks gender field as fallback
3. Normalizes category names
4. Counts purchases per category
5. Identifies dominant preference
6. Marks as "Family" if multiple categories

## Integration

### Backend Integration (index.js)
```javascript
const { startSegmentationScheduler } = require("./ml/segmentationScheduler");
const mlRoutes = require("./routes/ml");

// Start ML scheduler
if (ENABLE_SCHEDULERS) {
  startSegmentationScheduler();
}

// Register ML routes
app.use("/api/ml", mlRoutes);
```

### Frontend Integration
```javascript
// Fetch filtered customers using ML segmentation
const response = await fetch(`${API_URL}/ml/segmentation/filtered-customers`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    customerSegments: ['Loyal Customers', 'High value customers'],
    daysPeriod: 14
  })
});

const data = await response.json();
console.log(`Found ${data.count} customers`);
```

## Monitoring & Logging

The ML segmentation system provides detailed logging:

### Sync Operation Logs
```
🔄 [ML-Segmentation] Starting auto-segmentation sync...
📊 Configuration:
  Database: retail_db
  Orders Collection: newdatabase
  Segmentation Collection: customer_segmentation

✅ Connected to MongoDB

📋 Step 1: Getting all customers from orders...
   Found 250 unique customers in orders

📋 Step 2: Getting existing segmentation data...
   Found 200 customers already segmented

📋 Step 3: Identifying new customers...
   Found 50 new customers to segment

📋 Step 4: Segmenting new customers...
   Processing customer: C201
   ✅ C201: Loyal | High Value Customer | Mens
   ...

📋 Step 5: Inserting 50 new segmentation records...
   ✅ Successfully inserted 50 records

═══════════════════════════════════════════════════════
📊 ML SEGMENTATION SYNC SUMMARY
═══════════════════════════════════════════════════════
Total customers in orders:        250
Previously segmented:             200
Newly segmented:                  50
Now fully synced:                 250
═══════════════════════════════════════════════════════

✅ ML auto-segmentation complete!
```

## Troubleshooting

### Issue: No new customers being segmented
**Solution**: 
1. Check MongoDB connection
2. Verify orders collection has new data
3. Check ORDERS_COLLECTION environment variable
4. Manually trigger: `POST /api/ml/segmentation/sync`

### Issue: Incorrect segmentation
**Solution**:
1. Review algorithm thresholds in `autoSegmentation.js`
2. Check order data quality (dates, amounts, categories)
3. Verify field names in orders collection

### Issue: Scheduler not running
**Solution**:
1. Check `ENABLE_SCHEDULERS=true` in `.env`
2. Verify cron syntax in `segmentationScheduler.js`
3. Check backend logs for errors

## Testing

### Manual Testing
```bash
# Run segmentation manually
cd backend/ml
node autoSegmentation.js

# Test API endpoints
curl -X GET http://localhost:5001/api/ml/segmentation/stats

curl -X POST http://localhost:5001/api/ml/segmentation/filtered-customers \
  -H "Content-Type: application/json" \
  -d '{"customerSegments": ["Loyal Customers"], "daysPeriod": 14}'
```

## Future Enhancements

1. **Advanced ML Models**: Implement scikit-learn or TensorFlow for predictive segmentation
2. **Real-time Segmentation**: Update segments immediately on new orders
3. **Custom Segments**: Allow users to define custom segmentation rules
4. **Segment Analytics**: Provide detailed analytics per segment
5. **A/B Testing**: Test different segmentation strategies
6. **Churn Prediction**: Predict which customers are likely to lapse
7. **Lifetime Value**: Calculate and segment by predicted customer lifetime value

## Performance Optimization

- Uses MongoDB aggregation pipelines for efficient queries
- Batch inserts for new segmentations
- Prevents concurrent scheduler runs
- Indexes recommended on `customer_id` and segmentation fields

## Security Considerations

- All endpoints should be protected with authentication middleware
- Validate input parameters to prevent injection attacks
- Rate limit sync endpoint to prevent abuse
- Monitor for unusual segmentation patterns

## License

Part of the Automated Marketing Management System
