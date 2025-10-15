# Customer Segmentation Integration Guide

## Overview
This guide explains how the customer segmentation system works and how to set it up for testing.

## Architecture

### Backend Components

1. **Segmentation Controller** (`backend/controllers/segmentationController.js`)
   - Fetches segmented customer data from MongoDB Atlas
   - Filters customers based on selected segments
   - Provides customer count previews and detailed customer lists

2. **Campaign Model Updates** (`backend/models/Campaign.js`)
   - Added `targetedCustomerIds` array to store customer IDs
   - Added `targetedCustomerCount` to track number of targeted customers

3. **API Routes** (`backend/routes/segmentation.js`)
   - `GET /api/segmentation/available-segments` - Get all available segments with counts
   - `POST /api/segmentation/filtered-customers` - Get customers matching selected segments
   - `POST /api/segmentation/preview-count` - Preview customer count without fetching all data
   - `GET /api/segmentation/stats` - Get overall segmentation statistics

### Frontend Components

1. **Campaign Creation** (`frontend/src/Marketingmanager/CreatecampaingM.jsx` and `frontend/src/team member/CreatecampaingT.jsx`)
   - Real-time customer preview as segments are selected
   - Display of customer count and segmentation breakdown
   - Modal to view detailed customer list
   - Automatic fetching and filtering of customers

## How It Works

### Segment Mapping
The system maps UI-friendly segment names to database values:

| UI Label | Database Field | Database Value |
|----------|---------------|----------------|
| New Customers | purchase_frequency | New |
| Loyal Customers | purchase_frequency | Loyal |
| Lapsed Customers | purchase_frequency | Lapsed |
| Seasonal Customers | purchase_frequency | Seasonal |
| High value customers | spending | High Value Customer |
| Low value customers | spending | Low Value Customer |
| Medium Value | spending | Medium Value |
| Women | category | Womens |
| Men | category | Mens |
| Kids | category | Kids |
| Family | category | Family |

### Filter Logic

When multiple segments are selected:
- **Same Filter Type**: Customers matching ANY of the selected values (OR logic)
- **Different Filter Types**: Customers matching ALL filter types (AND logic)

**Example 1**: Select "New Customers" AND "High value customers"
- Results: Customers who are BOTH new AND high value

**Example 2**: Select "New Customers" AND "Loyal Customers"
- Results: Customers who are EITHER new OR loyal

**Example 3**: Select "New Customers", "High value customers", AND "Women"
- Results: Customers who are new AND high value AND shop in women's category

## Setup Instructions

### 1. Environment Variables

Add to your `.env` file:

```bash
# MongoDB Atlas connection (already configured)
MONGODB_URI=your_mongodb_atlas_connection_string

# Segmentation Database Configuration (optional - defaults shown)
SEGMENTATION_DB=retail_db
SEGMENTATION_COLLECTION=customer_segmentation
```

### 2. Install Dependencies

Ensure you have the MongoDB Node.js driver:

```bash
cd backend
npm install mongodb
```

### 3. Data Upload

The segmented customer data should already be uploaded to MongoDB Atlas using the Python script:

```bash
cd ml
python clean_posdata.py --input ../db/posdata.csv \
  --mongo-uri "$MONGODB_URI" \
  --database retail_db \
  --collection customer_segmentation
```

### 4. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Testing the Feature

### Test Case 1: Single Filter Selection

1. Navigate to Campaign Creation page
2. Select a filter: "Shopping Frequency"
3. Select a segment: "New Customers"
4. **Expected Result**: 
   - See customer count preview box
   - Count should show number of new customers
   - "View customer list" button appears

### Test Case 2: Multiple Segments (Same Filter)

1. Select filter: "Shopping Frequency"
2. Select segments: "New Customers" + "Loyal Customers"
3. **Expected Result**:
   - Count increases (OR logic - customers who are new OR loyal)
   - Both segments shown as selected tags

### Test Case 3: Multiple Filters (Intersection)

1. Select filter: "Shopping Frequency" → "New Customers"
2. Select filter: "Customer Value" → "High value customers"
3. **Expected Result**:
   - Count shows customers who are BOTH new AND high value
   - Count should be less than either individual segment

### Test Case 4: Customer List Modal

1. Select any segments
2. Click "View customer list"
3. **Expected Result**:
   - Modal opens showing customer table
   - Displays: Customer ID, Shopping Frequency, Spending Level, Category
   - Shows first 100 customers
   - Selected segments displayed at top

### Test Case 5: Remove Segments

1. Select multiple segments
2. Click X button on a segment tag
3. **Expected Result**:
   - Customer count updates immediately
   - Preview refreshes with new filtered count
   - If all segments removed, preview disappears

### Test Case 6: Campaign Submission

1. Fill in all campaign details
2. Select customer segments
3. Submit campaign
4. **Expected Result**:
   - Campaign saved with `targetedCustomerIds` array
   - Campaign includes `targetedCustomerCount` field
   - Campaign can be retrieved with customer targeting info

## API Testing with curl

### Get Available Segments
```bash
curl http://localhost:5001/api/segmentation/available-segments
```

### Get Filtered Customers
```bash
curl -X POST http://localhost:5001/api/segmentation/filtered-customers \
  -H "Content-Type: application/json" \
  -d '{
    "customerSegments": ["New Customers", "High value customers"]
  }'
```

### Preview Customer Count
```bash
curl -X POST http://localhost:5001/api/segmentation/preview-count \
  -H "Content-Type: application/json" \
  -d '{
    "customerSegments": ["New Customers"]
  }'
```

### Get Segmentation Statistics
```bash
curl http://localhost:5001/api/segmentation/stats
```

## Troubleshooting

### Issue: "No customers found"
**Solution**: 
- Check if segmented data is uploaded to MongoDB
- Verify collection name matches `SEGMENTATION_COLLECTION` env var
- Check segment name spelling matches the mapping table

### Issue: "Connection error"
**Solution**:
- Verify MongoDB URI is correct
- Check network connectivity to MongoDB Atlas
- Ensure IP address is whitelisted in MongoDB Atlas

### Issue: "Incorrect customer count"
**Solution**:
- Check if filter logic is correct (AND vs OR)
- Verify segment mappings in `segmentationController.js`
- Test with single segment first to isolate issue

### Issue: "Loading..." doesn't complete
**Solution**:
- Check browser console for errors
- Verify API endpoint is accessible
- Check backend logs for MongoDB connection issues

## Data Structure

### Customer Segmentation Document Example
```json
{
  "customer_id": "CUST0001",
  "segmentation": {
    "purchase_frequency": "New",
    "spending": "High Value Customer",
    "category": "Womens"
  }
}
```

### Campaign Document with Targeting
```json
{
  "title": "Holiday Campaign",
  "customerSegments": ["New Customers", "High value customers"],
  "targetedCustomerIds": ["CUST0001", "CUST0002", ...],
  "targetedCustomerCount": 1250,
  ...
}
```

## Performance Considerations

1. **Large Customer Lists**: Only first 100 customers shown in modal
2. **Preview Count**: Uses `countDocuments()` for efficiency
3. **Customer IDs**: Stored as array for quick lookup
4. **Indexing**: Consider adding indexes on segmentation fields for better performance:

```javascript
db.customer_segmentation.createIndex({ "segmentation.purchase_frequency": 1 })
db.customer_segmentation.createIndex({ "segmentation.spending": 1 })
db.customer_segmentation.createIndex({ "segmentation.category": 1 })
```

## Future Enhancements

1. **Export Customer List**: Add CSV/Excel export functionality
2. **Custom Segments**: Allow users to save segment combinations
3. **Segment Analytics**: Show distribution charts in preview
4. **Email Preview**: Show actual customer names in email preview
5. **A/B Testing**: Create multiple variants targeting different segments
6. **Campaign History**: Track which customers were targeted in past campaigns

## Support

For issues or questions:
1. Check MongoDB Atlas connection
2. Review backend logs: `backend/` directory
3. Check browser console for frontend errors
4. Verify environment variables are set correctly
