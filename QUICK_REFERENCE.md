# Quick Reference: 14-Day Customer Filter

## 🎯 What Changed?

**OLD:** New Customers = Customers from last **6 months** (180 days)  
**NEW:** New Customers = Customers from last **14 days**

## 🔄 How It Works Now

```
User Selects "New Customers"
        ↓
Backend queries orders collection
        ↓
Finds orders from last 14 days (order_date >= today - 14 days)
        ↓
Gets unique customer_ids from those orders
        ↓
Filters customer_segmentation by those customer_ids
        ↓
Enriches with email, phone, name from orders
        ↓
Returns filtered customers to frontend
```

## ⚠️ Your Current Data

Your orders are dated: **2024-01-15** (January 2024)  
Today's date: **October 2025**  
Days old: **~600+ days**

**Result:** "New Customers" filter will return **0 customers** until you add recent orders.

## ✅ What Works Right Now

These segments will work with your existing data:
- ✅ Loyal Customers
- ✅ Lapsed Customers  
- ✅ Seasonal Customers
- ✅ High value customers
- ✅ Medium Value
- ✅ Low value customers
- ✅ Men / Women / Kids / Family categories

## 🔧 Quick Fixes

### Option 1: Add Recent Test Orders (Recommended for Testing)

**MongoDB Atlas → newdatabase → orders → Add Data:**

```javascript
[
  {
    "order_id": "ORD99991",
    "customer_id": "CUST0001",
    "customer_name": "Nimal Rajapakse",
    "email": "nimal.rajapakse0001@gmail.com",
    "phone_number": "706439873",
    "order_date": new Date(),
    "product_category": "Men",
    "total_amount_lkr": 5000,
    "gender": "Male",
    "quantity": 1,
    "price_lkr": 5000,
    "email_valid": true,
    "phone_valid": true
  }
]
```

### Option 2: Increase Days (Use Your 2024 Data)

**In `CreatecampaingM.jsx` (line ~133):**
```javascript
body: JSON.stringify({ 
  customerSegments: segments,
  daysPeriod: 600 // Instead of 14
})
```

**In `CreatecampaingT.jsx` (line ~189):**
```javascript
body: JSON.stringify({ 
  customerSegments: segments,
  daysPeriod: 600 // Instead of 14
})
```

### Option 3: Use Different Segments

Test with: "Lapsed Customers" or "Medium Value" - these work immediately!

## 🚀 Testing Steps

### 1. Backend is Running ✅
```bash
# Already started at http://localhost:5001
# Check: Should see "MongoDB Connected" in console
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Campaign Creation
1. Login to the system
2. Navigate to Create Campaign
3. Add filters → Shopping Frequency
4. Select "Lapsed Customers" (will show count immediately)
5. Or select "New Customers" (will show 0 unless you added recent orders)

## 📊 Verify It's Working

### Check Backend Logs:
You should see:
```
Found X customers with orders in last 14 days
MongoDB Query: { $and: [...] }
```

### Check Frontend Console:
You should see:
```
✅ Found X customers matching selected segments (last 14 days)
```

### Check Customer Count Display:
```
Targeted Customers
X customers
```

## 🎨 Make Day Period Configurable (Optional Future Enhancement)

Add a dropdown in the UI:

```jsx
// In CreatecampaingM.jsx
const [daysPeriod, setDaysPeriod] = useState(14);

// In the form:
<select 
  value={daysPeriod} 
  onChange={(e) => setDaysPeriod(Number(e.target.value))}
>
  <option value="7">Last 7 days</option>
  <option value="14">Last 14 days</option>
  <option value="30">Last 30 days</option>
  <option value="90">Last 3 months</option>
  <option value="180">Last 6 months</option>
  <option value="365">Last year</option>
</select>

// Update API call:
body: JSON.stringify({ 
  customerSegments: segments,
  daysPeriod: daysPeriod // Use state value
})
```

## 📝 Files Changed

**Backend:**
- `controllers/segmentationController.js` - Date filtering logic
- `.env` - Database configuration

**Frontend:**
- `Marketingmanager/CreatecampaingM.jsx` - API call with daysPeriod
- `team member/CreatecampaingT.jsx` - API call with daysPeriod

## 🎯 Expected Results

### With Your Current 2024 Data:

| Segment Type | Expected Count |
|--------------|----------------|
| New Customers (14 days) | **0** (no recent orders) |
| Lapsed Customers | **✓ Shows count** |
| Loyal Customers | **✓ Shows count** |
| Medium Value | **✓ Shows count** |
| Men/Women/Kids | **✓ Shows count** |

### After Adding Recent Test Orders:

| Segment Type | Expected Count |
|--------------|----------------|
| New Customers (14 days) | **✓ Shows count** (test customers) |
| All other segments | **✓ Shows count** (existing + test) |

## ✨ Benefits

1. ✅ More precise targeting for recent customers
2. ✅ Better campaign relevance (14 days vs 6 months)
3. ✅ Enriched customer data (email, phone from orders)
4. ✅ Flexible - easily change the day period
5. ✅ Works with your MongoDB Atlas structure

## 🔗 Related Files

- `IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- `DATABASE_SETUP_GUIDE.md` - Database structure and testing
- `SEGMENTATION_PERIOD_UPDATE.md` - Technical documentation

---

**🎉 Ready to use! Just restart frontend and test it out!**
