# Auto-Segmentation Quick Reference

## ✅ What Was Done

Created an **automatic customer segmentation system** that syncs new customers from `newdatabase` to `customer_segmentation` collection.

## 🎯 Key Features

- ✅ **Runs automatically every 30 minutes**
- ✅ **Intelligent segmentation** based on purchase behavior
- ✅ **Zero manual intervention** needed
- ✅ **Works on server startup**
- ✅ **Manual sync available** via API or script

## 📁 Files Created/Modified

| File | Purpose |
|------|---------|
| `utils/autoSegmentation.js` | Core segmentation logic |
| `utils/segmentationScheduler.js` | Scheduler for automatic runs |
| `index.js` | Integrated scheduler on startup |
| `routes/segmentation.js` | Added manual sync endpoint |
| `test-CUS80000.js` | Test script for verification |
| `AUTO_SEGMENTATION_GUIDE.md` | Full documentation |

## 🚀 Quick Commands

```bash
# Start backend (auto-segmentation runs automatically)
cd backend
node index.js

# Manual sync via script
node utils/autoSegmentation.js

# Test specific customer
node test-CUS80000.js

# Manual sync via API
curl -X POST http://localhost:5001/api/segmentation/sync
```

## 🎨 Segmentation Logic

### Purchase Frequency
- **New**: First order within 30 days
- **Loyal**: 5+ orders over 3+ months
- **Lapsed**: No orders in 6 months
- **Seasonal**: Orders in 3 or fewer months

### Spending Level
- **High Value**: ≥50K LKR total or ≥20K average
- **Medium Value**: ≥10K LKR total or ≥3K average
- **Low Value**: Below medium thresholds

### Category
- **Mens/Womens/Kids**: Based on product category
- **Family**: Purchases from 2+ categories

## ✅ Verification (CUS80000)

```
✅ Order exists in newdatabase (Oct 14, 2025)
✅ Segmentation added automatically
✅ Marked as: New | High Value Customer | Mens
✅ Will appear in "New Customers" campaign filter
```

## 🔄 How It Works

1. **New order added** to MongoDB Atlas → `newdatabase`
2. **Scheduler runs** (every 30 min or on startup)
3. **Scans for new customers** not in segmentation
4. **Analyzes purchase history** and applies logic
5. **Adds to segmentation** collection automatically
6. **Available in campaigns** immediately

## 📊 Current Status

- **Total customers in orders**: 9,397
- **Segmented customers**: 9,397 ✅
- **New customers added**: 6 (including CUS80000)
- **Sync status**: All synced ✅

## 🎯 Next Steps

1. ✅ System is running automatically
2. ✅ Add any new orders to `newdatabase` in MongoDB Atlas
3. ✅ Wait max 30 minutes (or trigger manual sync)
4. ✅ Customer will appear in campaign filters automatically

## 🐛 Troubleshooting

**Customer not appearing?**
```bash
# Step 1: Check if order exists
node test-customer-string-id.js

# Step 2: Check segmentation
node test-CUS80000.js

# Step 3: Force sync
node utils/autoSegmentation.js
```

**Change frequency?**
Edit `utils/segmentationScheduler.js`:
```javascript
// Line 38: Change schedule
schedule = '*/15 * * * *'  // Every 15 minutes
```

## 📞 API Endpoint

```http
POST /api/segmentation/sync
```

Triggers immediate segmentation sync.

---

**Status:** ✅ ACTIVE & WORKING
**Last Sync:** Successful (6 customers added)
**Next Auto-Sync:** Every 30 minutes
