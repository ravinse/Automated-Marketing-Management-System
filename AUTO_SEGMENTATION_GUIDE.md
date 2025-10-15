# Auto-Segmentation System Documentation

## 🎯 Overview

The **Auto-Segmentation System** automatically monitors the `newdatabase` collection for new customer orders and adds them to the `customer_segmentation` collection with intelligent segmentation based on their purchase behavior.

## ✨ Features

### Automatic Segmentation
- **Runs every 30 minutes** automatically in the background
- **Runs on server startup** to catch any missed customers
- **Intelligent segmentation logic** based on purchase history
- **Zero manual intervention** required

### Segmentation Categories

#### 1. **Purchase Frequency**
- **New**: First order within 30 days or recent first purchase
- **Loyal**: 5+ orders over more than 3 months
- **Lapsed**: No orders in last 6 months (180 days)
- **Seasonal**: Orders concentrated in specific months (3 or fewer months)

#### 2. **Spending Level**
- **High Value Customer**: 
  - Total spending ≥ 50,000 LKR OR
  - Average order value ≥ 20,000 LKR
- **Medium Value**: 
  - Total spending ≥ 10,000 LKR OR
  - Average order value ≥ 3,000 LKR
- **Low Value Customer**: 
  - Below medium thresholds

#### 3. **Category Preference**
- **Mens**: Primarily purchases men's products
- **Womens**: Primarily purchases women's products
- **Kids**: Primarily purchases kids' products
- **Family**: Purchases from multiple categories (2+ categories)

## 📁 Files Created

### 1. `/backend/utils/autoSegmentation.js`
Core segmentation logic that:
- Finds customers in `newdatabase` not yet in `customer_segmentation`
- Analyzes purchase history for each customer
- Applies intelligent segmentation rules
- Inserts segmentation records

### 2. `/backend/utils/segmentationScheduler.js`
Scheduler that:
- Runs auto-segmentation every 30 minutes
- Executes immediately on server startup
- Prevents duplicate concurrent runs
- Provides logging for monitoring

### 3. Updated `/backend/index.js`
Integrated the scheduler to start automatically when backend starts.

### 4. Updated `/backend/routes/segmentation.js`
Added manual sync endpoint for on-demand synchronization.

## 🚀 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  1. New Order Added to MongoDB Atlas                        │
│     Collection: newdatabase                                 │
│     Customer: CUS80000                                      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Auto-Segmentation Scheduler                             │
│     • Runs every 30 minutes automatically                   │
│     • Scans newdatabase for new customers                   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Intelligent Analysis                                    │
│     • Purchase frequency analysis                           │
│     • Spending level calculation                            │
│     • Category preference detection                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Add to Segmentation                                     │
│     Collection: customer_segmentation                       │
│     With: purchase_frequency, spending, category            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Available in Campaigns                                  │
│     Customer now appears in segment filters                 │
│     Ready for campaign targeting                            │
└─────────────────────────────────────────────────────────────┘
```

## 🎮 Usage

### Automatic Mode (Default)
The system runs automatically. No action needed!

```bash
# Just start your backend server
cd backend
npm start
```

You'll see these logs:
```
📅 Customer segmentation scheduler started
⏰ Schedule: Every 30 minutes (*/30 * * * *)
🔄 The system will automatically segment new customers

🔄 [Auto-Segmentation] Starting scheduled sync...
✅ [Auto-Segmentation] Added 6 new customer(s) to segmentation
```

### Manual Trigger via API

If you need to trigger segmentation immediately:

```bash
# Trigger manual sync
curl -X POST http://localhost:5001/api/segmentation/sync \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "success": true,
  "message": "Segmentation sync completed successfully"
}
```

### Manual Trigger via Script

```bash
cd backend
node utils/autoSegmentation.js
```

## 📊 Example Output

```
🔄 Starting auto-segmentation sync...

📊 Configuration:
  Database: retail_db
  Orders Collection: newdatabase
  Segmentation Collection: customer_segmentation

✅ Connected to MongoDB

📋 Step 1: Getting all customers from orders...
   Found 9397 unique customers in orders

📋 Step 2: Getting existing segmentation data...
   Found 9391 customers already segmented

📋 Step 3: Identifying new customers...
   Found 6 new customers to segment

📋 Step 4: Segmenting new customers...
   Processing customer: CUS80000
   ✅ CUS80000: New | High Value Customer | Mens
   Processing customer: CUSW0002
   ✅ CUSW0002: New | Medium Value | Mens

📋 Step 5: Inserting 6 new segmentation records...
   ✅ Successfully inserted 6 records

═══════════════════════════════════════════════════════
📊 SYNC SUMMARY
═══════════════════════════════════════════════════════
Total customers in orders:        9397
Previously segmented:             9391
Newly segmented:                  6
Now fully synced:                 9397
═══════════════════════════════════════════════════════

✅ Auto-segmentation complete!
```

## ⚙️ Configuration

### Change Schedule Frequency

Edit `/backend/utils/segmentationScheduler.js`:

```javascript
// Every 30 minutes (default)
function startSegmentationScheduler(schedule = '*/30 * * * *')

// Other options:
// Every hour:        '0 * * * *'
// Every 2 hours:     '0 */2 * * *'
// Every 15 minutes:  '*/15 * * * *'
// Daily at midnight: '0 0 * * *'
```

### Customize Segmentation Thresholds

Edit `/backend/utils/autoSegmentation.js`:

```javascript
// Spending thresholds (in LKR)
const HIGH_VALUE_THRESHOLD = 50000;  // Adjust as needed
const HIGH_AVG_THRESHOLD = 20000;
const LOW_VALUE_THRESHOLD = 10000;
const LOW_AVG_THRESHOLD = 3000;

// Time periods (in days)
const NEW_CUSTOMER_DAYS = 30;        // Within 30 days
const LAPSED_CUSTOMER_DAYS = 180;    // 6 months inactive
const LOYAL_CUSTOMER_DAYS = 90;      // 3+ months active
```

## 🧪 Testing

### Test Customer CUS80000

```bash
cd backend
node test-CUS80000.js
```

Expected output shows:
- ✅ Order exists in newdatabase
- ✅ Segmentation data exists
- ✅ Marked as "New" customer
- ✅ Has recent orders (within 14 days)

### Test Any Customer ID

Create a test script or modify `test-CUS80000.js` to test any customer ID.

## 🔍 Monitoring

### Check Logs
Watch your backend console for:
```
✅ [Auto-Segmentation] Added X new customer(s) to segmentation
✅ [Auto-Segmentation] All customers are already segmented
```

### Database Verification
Check MongoDB Atlas:
- Database: `retail_db`
- Collection: `customer_segmentation`
- Look for your customer_id with segmentation data

## 🐛 Troubleshooting

### Issue: Customers not appearing in campaigns

**Check 1:** Verify order exists in `newdatabase`
```bash
node test-customer-string-id.js
```

**Check 2:** Verify segmentation data exists
```bash
node test-CUS80000.js
```

**Check 3:** Trigger manual sync
```bash
node utils/autoSegmentation.js
```

### Issue: Scheduler not running

**Check:** Backend server logs show:
```
📅 Customer segmentation scheduler started
⏰ Schedule: Every 30 minutes
```

If not, verify:
1. `node-cron` is installed: `npm list node-cron`
2. `index.js` imports the scheduler
3. `startSegmentationScheduler()` is called

### Issue: Wrong segmentation

**Solution:** Update thresholds in `autoSegmentation.js` and re-run:
```bash
# Delete existing segmentation (optional)
# Then re-run
node utils/autoSegmentation.js
```

## 📝 Best Practices

1. **Monitor the first few runs** to ensure segmentation logic matches your business rules
2. **Adjust thresholds** based on your customer base and currency
3. **Keep logs** for troubleshooting and analytics
4. **Run manual sync** after bulk imports to newdatabase
5. **Test with sample customers** before going live

## 🎉 Success Verification

After adding new order to MongoDB Atlas:

1. **Wait up to 30 minutes** (or trigger manual sync)
2. **Check backend logs** for sync confirmation
3. **Create campaign** and select "New Customers" segment
4. **Verify customer appears** in the filtered list

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend console logs
3. Verify MongoDB connection
4. Test with manual sync script

---

**Last Updated:** October 15, 2025
**Version:** 1.0.0
**Tested with:** Customer CUS80000 ✅
