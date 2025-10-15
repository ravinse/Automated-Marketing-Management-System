# Customer Segmentation Period Update

## Overview
Updated the customer segmentation filtering to use **14 days** instead of **6 months** for identifying "New Customers".

## Changes Made

### 1. Backend Changes (`backend/controllers/segmentationController.js`)

#### Updated Functions:
- `getFilteredCustomers()` - Added `daysPeriod` parameter (default: 14 days)
- `previewCustomerCount()` - Added `daysPeriod` parameter (default: 14 days)

#### Key Updates:
- Added date-based filtering for "New Customers" segment
- Calculates date threshold: `current date - daysPeriod`
- Filters customers based on `last_purchase_date` or `first_purchase_date` within the specified period
- Returns `daysPeriod` in API response for transparency

### 2. Frontend Changes

#### Updated Files:
- `frontend/src/Marketingmanager/CreatecampaingM.jsx`
- `frontend/src/team member/CreatecampaingT.jsx`

#### Key Updates:
- Added `daysPeriod: 14` parameter to API calls
- Updated console logs to show "last 14 days" for clarity

## How It Works

When "New Customers" segment is selected:

1. **Backend calculates date threshold:**
   ```javascript
   const dateThreshold = new Date();
   dateThreshold.setDate(dateThreshold.getDate() - 14); // 14 days ago
   ```

2. **Queries orders collection for recent purchases:**
   ```javascript
   db.orders.aggregate([
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
   ])
   ```

3. **Filters customer_segmentation by customer IDs with recent orders**

4. **Enriches customer data with email, phone, and order details from orders collection**

5. **Returns filtered customer count and details**

## Database Requirements

Your MongoDB database should have two collections:

### 1. `customer_segmentation` collection:
```json
{
  "customer_id": "CUST0001",
  "segmentation": {
    "purchase_frequency": "Lapsed",
    "spending": "Medium Value",
    "category": "Mens"
  }
}
```

### 2. `orders` collection:
```json
{
  "order_id": "ORD00001",
  "customer_id": "CUST0001",
  "customer_name": "Nimal Rajapakse",
  "email": "nimal.rajapakse0001@gmail.com",
  "phone_number": "706439873",
  "order_date": ISODate("2024-01-15T00:00:00.000Z"),
  "product_category": "Men",
  "total_amount_lkr": 16350
}
```

**Key Field:** The `order_date` field in the `orders` collection is used to determine customer recency for the "New Customers" filter.

## Customization

To change the period from 14 days to another value:

### Option 1: Change the default value
In `segmentationController.js`:
```javascript
const { customerSegments, daysPeriod = 30 } = req.body; // Change to 30 days
```

### Option 2: Pass different values from frontend
In `CreatecampaingM.jsx` and `CreatecampaingT.jsx`:
```javascript
body: JSON.stringify({ 
  customerSegments: segments,
  daysPeriod: 30 // Change to desired number of days
})
```

### Option 3: Make it configurable via UI
Add a dropdown or input field in the frontend to let users choose the period dynamically:
```jsx
<select onChange={(e) => setDaysPeriod(e.target.value)}>
  <option value="7">Last 7 days</option>
  <option value="14">Last 14 days</option>
  <option value="30">Last 30 days</option>
  <option value="90">Last 90 days</option>
</select>
```

## Environment Configuration

Make sure your backend `.env` file has the correct database name:

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://your-connection-string
SEGMENTATION_DB=newdatabase
SEGMENTATION_COLLECTION=customer_segmentation
```

The system will automatically use:
- Database: `newdatabase` (configurable via `SEGMENTATION_DB`)
- Collections: `customer_segmentation` and `orders`

## Testing

1. **Restart backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Restart frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the filtering:**
   - Go to Campaign Creation page
   - Select "New Customers" segment
   - Verify the customer count reflects only customers active in the last 14 days
   - Check browser console for log: "Found X customers matching selected segments (last 14 days)"

## Important Notes

⚠️ **Database Dependency:** The date filtering relies on having accurate date fields in your customer data. If these fields are missing or incorrectly formatted, you may see:
- Zero customers returned
- All customers returned (if date filter is ignored)
- Database errors in the backend logs

🔍 **Verify Your Data:** Check if your MongoDB collections exist and have the required fields:
```javascript
// Check customer_segmentation collection
db.customer_segmentation.findOne()

// Check orders collection with recent orders
db.orders.find({ 
  order_date: { 
    $gte: new Date(new Date().setDate(new Date().getDate() - 14)) 
  } 
}).limit(5)
```

## Future Enhancements

Consider these improvements:
1. Add UI control for dynamic period selection
2. Add date range picker for custom periods
3. Show date range in customer preview
4. Add validation for date fields before filtering
5. Provide fallback logic if date fields are missing
