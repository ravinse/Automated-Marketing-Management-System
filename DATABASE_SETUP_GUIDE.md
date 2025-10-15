# Database Setup Guide for MongoDB Atlas

## Database Structure

Your MongoDB Atlas database `newdatabase` contains:

### Collections:
1. **orders** - Contains order history with customer details
2. **customer_segmentation** - Contains customer segmentation data

## Collection Schemas

### 1. Orders Collection
```json
{
  "_id": ObjectId("..."),
  "id": "ORD00001",
  "order_id": "ORD00001",
  "customer_id": "CUST0001",
  "customer_name": "Nimal Rajapakse",
  "gender": "Male",
  "product_name": "T-shirt",
  "product_category": "Men",
  "clothing_category": "Tops",
  "quantity": 5,
  "price_lkr": 3270,
  "total_amount_lkr": 16350,
  "email": "nimal.rajapakse0001@gmail.com",
  "phone_number": "706439873",
  "order_date": ISODate("2024-01-15T00:00:00.000Z"),
  "email_valid": true,
  "phone_valid": true,
  "order_year": 2024,
  "order_month": 1
}
```

### 2. Customer Segmentation Collection
```json
{
  "_id": ObjectId("68ef9dbfb1ed017bce924562"),
  "customer_id": "CUST0001",
  "segmentation": {
    "purchase_frequency": "Lapsed",
    "spending": "Medium Value",
    "category": "Mens"
  }
}
```

## Segmentation Categories

### Purchase Frequency:
- **New** - Recent customers (filtered by last 14 days of orders)
- **Loyal** - Regular purchasers
- **Lapsed** - Customers who haven't purchased recently
- **Seasonal** - Customers with seasonal patterns

### Spending:
- **High Value Customer** - High spenders
- **Medium Value** - Average spenders
- **Low Value Customer** - Low spenders

### Category (Product Preference):
- **Mens** - Men's products
- **Womens** - Women's products
- **Kids** - Kids products
- **Family** - Family/mixed products

## Environment Configuration

Update your `backend/.env` file:

```env
# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Database Configuration
SEGMENTATION_DB=newdatabase
SEGMENTATION_COLLECTION=customer_segmentation

# Other configurations...
PORT=5001
JWT_SECRET=your_secret_key
```

## How the 14-Day Filter Works

When users select "New Customers" in the campaign creation:

1. **System queries orders collection:**
   - Finds all orders from the last 14 days
   - Groups by `customer_id` to get unique customers

2. **Filters customer_segmentation:**
   - Matches customers from step 1
   - Applies additional segment filters (spending, category, etc.)

3. **Enriches data:**
   - Adds `customer_name`, `email`, `phone_number` from orders
   - Calculates `last_order_date` and `total_orders`

4. **Returns:**
   - Filtered customer list
   - Total count
   - Customer details for campaign targeting

## Testing Your Setup

### 1. Check Database Connection
```bash
cd backend
node -e "
const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI || 'your-connection-string';
const client = new MongoClient(uri);
client.connect()
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    return client.db('newdatabase').listCollections().toArray();
  })
  .then(collections => {
    console.log('Collections:', collections.map(c => c.name));
    client.close();
  })
  .catch(err => {
    console.error('❌ Connection failed:', err);
  });
"
```

### 2. Verify Recent Orders
Open MongoDB Atlas and run this query in the `orders` collection:

```javascript
// Find orders from last 14 days
db.orders.find({
  order_date: {
    $gte: new Date(new Date().setDate(new Date().getDate() - 14))
  }
}).limit(10)
```

### 3. Check Customer Segments
```javascript
// Count customers by segment
db.customer_segmentation.aggregate([
  {
    $group: {
      _id: "$segmentation.purchase_frequency",
      count: { $sum: 1 }
    }
  }
])
```

## Expected Customer Counts

Based on your data:
- If you have orders from **2024-01** (January 2024)
- And today's date is **October 2025**
- **No customers** will match "New Customers" with 14-day filter (orders are too old)

### ⚠️ Important Note:
Your sample data shows `order_date: 2024-01-15` (January 15, 2024). This is **over 600 days old**, so with a 14-day filter, you'll get **0 customers**.

### Solutions:

#### Option 1: Update Order Dates (Testing)
Create some recent test orders:
```javascript
// In MongoDB Atlas
db.orders.insertOne({
  order_id: "ORD99999",
  customer_id: "CUST0001",
  customer_name: "Nimal Rajapakse",
  email: "nimal.rajapakse0001@gmail.com",
  phone_number: "706439873",
  order_date: new Date(), // Today's date
  product_category: "Men",
  total_amount_lkr: 5000
})
```

#### Option 2: Increase Day Period
Change `daysPeriod` from 14 to a larger number (e.g., 365 days or 600 days) to include your existing data:

In frontend files:
```javascript
body: JSON.stringify({ 
  customerSegments: segments,
  daysPeriod: 365 // One year instead of 14 days
})
```

#### Option 3: Use Different Segments
Instead of "New Customers", use:
- "Loyal Customers"
- "Lapsed Customers"
- "High value customers"
- "Medium Value"
- Specific product categories (Men, Women, Kids)

These segments will work regardless of order dates!

## Troubleshooting

### Issue: 0 customers returned
**Cause:** No orders in the last 14 days

**Solutions:**
1. Add recent test orders
2. Increase `daysPeriod` to match your data range
3. Use different customer segments

### Issue: Database connection error
**Cause:** Incorrect MongoDB URI

**Solution:** 
1. Check your `.env` file
2. Verify MongoDB Atlas credentials
3. Ensure IP address is whitelisted
4. Check network access settings

### Issue: Missing customer emails
**Cause:** Orders collection doesn't have email data

**Solution:** Ensure all orders have `email` and `phone_number` fields populated

## Quick Start for Testing

1. **Update `.env`:**
   ```env
   MONGO_URI=your_atlas_connection_string
   SEGMENTATION_DB=newdatabase
   ```

2. **Restart backend:**
   ```bash
   cd backend
   npm start
   ```

3. **Create campaign with:**
   - Select "Lapsed Customers" or "Medium Value" (these will work)
   - Or add recent test orders to test "New Customers"

4. **Verify count displays correctly**

## Summary

✅ Your database structure is correctly set up
✅ The system now queries `orders` collection for date filtering
✅ Customer data is enriched with email/phone from orders
⚠️ Your sample data is from 2024, so 14-day filter will return 0 results
💡 Use 365+ days or different segments to see your existing customers
