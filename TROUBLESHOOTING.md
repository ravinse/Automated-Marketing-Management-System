# Troubleshooting: 0 Customers Found

## Problem
When selecting customer segments in campaign creation, the system shows:
```
Targeted Customers
0 customers
This campaign will target 0 customers matching your selected segments.
```

## Root Cause
The segmentation API routes are not loaded because the backend server hasn't been restarted since the new code was added.

## Solution

### Step 1: Restart Backend Server

1. **Stop the current backend server**:
   - Go to the terminal running the backend
   - Press `Ctrl+C` to stop it

2. **Start the backend again**:
   ```bash
   cd backend
   npm start
   ```
   
   Or if using nodemon:
   ```bash
   npm run dev
   ```

3. **Verify the server started**:
   Look for: `🚀 Server running on port 5001`

### Step 2: Test the API

Run this command to test if the segmentation API is working:

```bash
curl http://localhost:5001/api/segmentation/stats
```

**Expected Output**: JSON with customer statistics
```json
{
  "success": true,
  "stats": {
    "totalCustomers": 10000,
    "byFrequency": {...},
    "bySpending": {...},
    "byCategory": {...}
  }
}
```

**If you get an error**: The routes aren't loaded. Make sure you restarted the backend.

### Step 3: Test Customer Filtering

```bash
curl -X POST http://localhost:5001/api/segmentation/filtered-customers \
  -H "Content-Type: application/json" \
  -d '{"customerSegments": ["New Customers"]}'
```

**Expected Output**: JSON with customer list and count

### Step 4: Verify in Browser

1. Open browser developer console (F12)
2. Go to Campaign Creation page
3. Select a customer segment
4. Check console for messages:
   - ✅ `Found X customers matching selected segments` - Success!
   - ❌ `Failed to fetch customer preview` - API error
   - ❌ `Error fetching customer preview` - Network error

## Common Issues

### Issue 1: "Cannot POST /api/segmentation/..."
**Cause**: Backend not restarted after adding new routes
**Solution**: Restart backend server (Step 1 above)

### Issue 2: MongoDB Connection Error
**Cause**: MongoDB URI not configured or incorrect
**Solution**: 
1. Check `.env` file has `MONGODB_URI=your_connection_string`
2. Verify connection string is correct
3. Check MongoDB Atlas IP whitelist includes your IP

### Issue 3: Collection Not Found
**Cause**: Customer segmentation data not uploaded
**Solution**:
```bash
cd ml
python clean_posdata.py \
  --input ../db/posdata.csv \
  --mongo-uri "$MONGODB_URI" \
  --database retail_db \
  --collection customer_segmentation
```

### Issue 4: CORS Error in Browser
**Cause**: Frontend URL not in CORS whitelist
**Solution**: Add your frontend URL to `backend/index.js`:
```javascript
app.use(cors({ 
  origin: ["http://localhost:5173", "http://localhost:5174", ...]
}));
```

## Verification Checklist

- [ ] Backend server restarted
- [ ] Can access `http://localhost:5001/`
- [ ] Can access `http://localhost:5001/api/segmentation/stats`
- [ ] MongoDB connection working
- [ ] Customer segmentation collection exists
- [ ] Frontend can reach backend (no CORS errors)
- [ ] Browser console shows no errors

## Still Not Working?

### Check Backend Logs
Look at the terminal running the backend for errors like:
- MongoDB connection errors
- Missing environment variables
- Route registration errors

### Check Frontend Console
Press F12 in browser and look for:
- Network errors (red)
- CORS errors
- API response errors

### Manual API Test
Use the test script:
```bash
chmod +x test_segmentation_api.sh
./test_segmentation_api.sh
```

This will test all API endpoints and show which ones are working.

## Quick Fix Command

Run this all-in-one test:

```bash
# Test if backend is running
curl -s http://localhost:5001/ && echo "✅ Backend running" || echo "❌ Backend not running"

# Test if segmentation API is loaded
curl -s http://localhost:5001/api/segmentation/stats | head -5 && echo "✅ API loaded" || echo "❌ API not loaded - RESTART BACKEND"

# Test customer filtering
curl -s -X POST http://localhost:5001/api/segmentation/preview-count \
  -H "Content-Type: application/json" \
  -d '{"customerSegments": ["New Customers"]}' | grep -q "count" && echo "✅ Filtering works" || echo "❌ Filtering failed"
```

## Need More Help?

1. Check `SEGMENTATION_SETUP.md` for detailed setup instructions
2. Check `IMPLEMENTATION_SUMMARY.md` for technical details
3. Review backend logs for specific errors
4. Check MongoDB Atlas dashboard for connection issues
