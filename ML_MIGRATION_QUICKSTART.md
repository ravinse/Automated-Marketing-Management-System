# Segmentation to ML Migration - Quick Start Guide

## ✅ Migration Complete!

All segmentation functionality has been successfully moved to the ML section with proper routing updates.

## 🚀 Quick Start

### 1. Restart Backend Server
```bash
cd backend
npm start
```

**Look for these logs:**
```
🚀 Server running on port 5001
🔄 Starting internal schedulers...
📅 ML Customer segmentation scheduler started
⏰ Schedule: Every 1 minute (*/1 * * * *)
🔄 The system will automatically segment new customers using ML algorithms
```

### 2. Test API Endpoint
```bash
# Test if ML segmentation is working
curl http://localhost:5001/api/ml/segmentation/stats
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "totalCustomers": 250,
    "byFrequency": { ... },
    "bySpending": { ... },
    "byCategory": { ... }
  }
}
```

### 3. Test Frontend
1. Start frontend: `npm run dev` (in frontend directory)
2. Go to Campaign Creation page
3. Select customer segments
4. Should see customer count update automatically

## 📍 What Changed

### API Routes Changed:
- ❌ OLD: `/api/segmentation/*`
- ✅ NEW: `/api/ml/segmentation/*`

### Files Moved:
```
controllers/segmentationController.js  →  ml/segmentationController.js
utils/autoSegmentation.js             →  ml/autoSegmentation.js
utils/segmentationScheduler.js        →  ml/segmentationScheduler.js
routes/segmentation.js                →  routes/ml.js (updated)
```

## 🔍 Verify Everything Works

### Backend Checks:
- [ ] Server starts without errors
- [ ] ML scheduler initializes
- [ ] No import/require errors
- [ ] Endpoints respond correctly

### Frontend Checks:
- [ ] Campaign creation loads
- [ ] Customer segments selectable
- [ ] Customer preview shows data
- [ ] No console errors about 404s

### API Endpoint Tests:
```bash
# 1. Get stats
curl http://localhost:5001/api/ml/segmentation/stats

# 2. Get available segments
curl http://localhost:5001/api/ml/segmentation/available-segments

# 3. Trigger manual sync
curl -X POST http://localhost:5001/api/ml/segmentation/sync

# 4. Filter customers
curl -X POST http://localhost:5001/api/ml/segmentation/filtered-customers \
  -H "Content-Type: application/json" \
  -d '{"customerSegments":["Loyal Customers"],"daysPeriod":14}'
```

## 🐛 Troubleshooting

### Issue: 404 Not Found on /api/ml/segmentation/*
**Solution**: 
- Restart backend server
- Check `backend/index.js` has `app.use("/api/ml", mlRoutes)`
- Verify `backend/routes/ml.js` exists

### Issue: Module not found error
**Solution**:
- Check all import paths updated to `./ml/` or `../ml/`
- Verify files exist in `backend/ml/` directory

### Issue: Frontend gets 404 errors
**Solution**:
- Clear browser cache
- Check frontend uses `/api/ml/segmentation/*`
- Search frontend code for old `/api/segmentation/` references

### Issue: Scheduler not running
**Solution**:
- Set `ENABLE_SCHEDULERS=true` in `.env`
- Check backend logs for scheduler start message
- Verify `ml/segmentationScheduler.js` imported correctly

## 📚 Documentation

- **Detailed ML Documentation**: `backend/ml/README.md`
- **Migration Summary**: `SEGMENTATION_MIGRATION_SUMMARY.md`
- **API Reference**: See README.md in `backend/ml/`

## 🎯 Next Steps

1. **Test thoroughly** in development
2. **Monitor backend logs** for ML messages
3. **Verify customer segmentation** works end-to-end
4. **Optional**: Remove old segmentation files after 1-2 weeks

## 📞 Need Help?

Check these in order:
1. Backend console logs (look for `[ML-Segmentation]` messages)
2. Frontend console (check for API errors)
3. MongoDB connection (verify data exists)
4. Environment variables (`.env` file)

## ⚡ Quick Test Command

Run all tests at once:
```bash
# From project root
echo "Testing ML Segmentation Endpoints..."
curl -s http://localhost:5001/api/ml/segmentation/stats | jq .success
curl -s http://localhost:5001/api/ml/segmentation/available-segments | jq .success
echo "✅ If you see 'true' twice above, everything is working!"
```

---

**Status**: ✅ Migration Complete  
**Ready for Testing**: Yes  
**Breaking Changes**: API routes only (frontend updated)
