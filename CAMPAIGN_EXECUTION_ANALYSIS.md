# Campaign Auto-Execution Analysis & Issues Found

## Executive Summary
After analyzing the campaign auto-execution system, I found **several critical issues** that prevent campaigns from executing properly when their scheduled time arrives. The system needs significant fixes.

---

## 🔴 Critical Issues Found

### Issue #1: Wrong Data Source for Customer Retrieval
**Location**: `backend/utils/campaignScheduler.js` - `executeCampaignAutomatically()`

**Problem**:
```javascript
// WRONG: Tries to get customers from Customer model in main database
customers = await Customer.find({
  _id: { $in: campaign.targetedCustomerIds }
});
```

**Why It Fails**:
- Campaign stores customer IDs from the **segmentation database** (MongoDB Atlas)
- The `Customer` model refers to the **main application database** (different database)
- Customer IDs won't match between these two separate databases
- Result: **No customers found, no emails/SMS sent**

**Should Be**:
```javascript
// Get customers from segmentation/orders database
const mongoClient = new MongoClient(MONGODB_URI);
await mongoClient.connect();
const db = mongoClient.db(DATABASE_NAME);
const ordersCollection = db.collection(ORDERS_COLLECTION);

const customerData = await ordersCollection.aggregate([
  { $match: { customer_id: { $in: campaign.targetedCustomerIds } } },
  {
    $group: {
      _id: "$customer_id",
      customer_name: { $first: "$customer_name" },
      email: { $first: "$email" },
      phone_number: { $first: "$phone_number" }
    }
  }
]).toArray();
```

---

### Issue #2: Missing Time Component in Scheduler Check
**Location**: `backend/utils/campaignScheduler.js` - `checkAndStartScheduledCampaigns()`

**Problem**:
```javascript
const scheduledCampaigns = await Campaign.find({
  status: 'approved',
  startDate: { $lte: now }  // Only checks DATE, not TIME
});
```

**Why It Fails**:
- Checks only if date has arrived, not the specific time
- Campaign scheduled for "Oct 16, 2025 at 2:00 PM" will trigger at midnight (12:00 AM)
- **Campaigns execute at wrong time - hours before scheduled**

**Impact**:
- Campaigns with `startDate: "2025-10-16T14:00:00.000Z"` (2:00 PM)
- Will execute at `2025-10-16T00:00:00.000Z` (midnight)
- **14 hours too early!**

---

### Issue #3: Scheduler Runs Every 5 Minutes (Too Slow)
**Location**: `backend/utils/campaignScheduler.js` - `startCampaignScheduler()`

**Problem**:
```javascript
// Run every 5 minutes (300000 milliseconds)
const schedulerInterval = setInterval(runScheduledChecks, 5 * 60 * 1000);
```

**Why It's Problematic**:
- A campaign scheduled for 2:00 PM might not execute until 2:05 PM
- Up to **5-minute delay** for campaign execution
- Poor user experience for time-sensitive campaigns

**Should Be**: Every 1 minute for better accuracy

---

### Issue #4: Customer Segment Fallback is Wrong
**Location**: `backend/utils/campaignScheduler.js` - `executeCampaignAutomatically()`

**Problem**:
```javascript
// Fallback tries to use segment field that doesn't exist
customers = await Customer.find({
  segment: { $in: campaign.customerSegments }  // WRONG MODEL & FIELD
});
```

**Why It Fails**:
1. Wrong database (main DB instead of segmentation DB)
2. Field name is wrong (should be `segmentation.purchase_frequency`, etc.)
3. This fallback will **never work**

---

### Issue #5: Scheduler Might Be Disabled by Default
**Location**: `backend/index.js`

**Problem**:
```javascript
const ENABLE_SCHEDULERS = process.env.ENABLE_SCHEDULERS === 'true';
```

**Why It's Problematic**:
- If `ENABLE_SCHEDULERS` is not set in `.env`, schedulers won't run
- **Campaigns will never auto-execute**
- Silent failure - no error messages

**Check Your `.env` File**:
```bash
# Must have this line:
ENABLE_SCHEDULERS=true
```

---

## ✅ What Works Correctly

### 1. Manual Execution Works
- The `executeCampaign` API endpoint (POST `/api/campaigns/:id/execute`) works correctly
- Uses proper segmentation database
- Fetches customers correctly
- Sends emails/SMS successfully

### 2. Campaign Completion Works
- `checkAndCompleteExpiredCampaigns()` correctly marks expired campaigns as completed
- Date/time checking is correct for this function

### 3. Campaign Status Flow is Good
- Draft → Pending Approval → Approved → Running → Completed
- Status transitions are properly handled

---

## 🔧 Required Fixes

### Fix #1: Update `executeCampaignAutomatically()` Function

**File**: `backend/utils/campaignScheduler.js`

**Replace entire function with**:
```javascript
const executeCampaignAutomatically = async (campaign) => {
  let mongoClient;
  try {
    console.log(`🚀 Auto-executing campaign: ${campaign.title} (ID: ${campaign._id})`);

    // Get targeted customers from segmentation database
    let customers = [];
    
    // Connect to segmentation database
    const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
    const DATABASE_NAME = process.env.SEGMENTATION_DB || 'retail_db';
    const ORDERS_COLLECTION = process.env.ORDERS_COLLECTION || 'newdatabase';
    
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    const db = mongoClient.db(DATABASE_NAME);
    const ordersCollection = db.collection(ORDERS_COLLECTION);
    
    if (campaign.targetedCustomerIds && campaign.targetedCustomerIds.length > 0) {
      console.log(`📋 Fetching ${campaign.targetedCustomerIds.length} targeted customers by IDs`);
      
      const customerData = await ordersCollection.aggregate([
        {
          $match: { customer_id: { $in: campaign.targetedCustomerIds } }
        },
        {
          $group: {
            _id: "$customer_id",
            customer_name: { $first: "$customer_name" },
            email: { $first: "$email" },
            phone_number: { $first: "$phone_number" }
          }
        }
      ]).toArray();
      
      console.log(`   Found ${customerData.length} customers in orders collection`);
      
      customers = customerData.map(c => ({
        _id: c._id,
        name: c.customer_name,
        email: c.email,
        phone: c.phone_number
      }));
    }

    if (customers.length === 0) {
      console.log(`⚠️ No customers found for campaign: ${campaign.title}`);
      await mongoClient.close();
      return { success: false, reason: 'No customers found' };
    }

    console.log(`📧 Found ${customers.length} customers for campaign execution`);

    let emailsSent = 0;
    let smsSent = 0;

    // Send emails if email content is provided
    if (campaign.emailSubject && campaign.emailContent) {
      const emailRecipients = customers
        .filter(customer => customer.email)
        .map(customer => ({
          email: customer.email,
          subject: campaign.emailSubject,
          content: campaign.emailContent,
        }));

      if (emailRecipients.length > 0) {
        const emailResults = await sendBatchEmails(
          emailRecipients,
          campaign.emailSubject,
          campaign.emailContent
        );
        emailsSent = emailResults.sent;
        console.log(`✉️ Emails sent: ${emailsSent}/${emailResults.total}`);
      }
    }

    // Send SMS if SMS content is provided
    if (campaign.smsContent) {
      const smsRecipients = customers
        .filter(customer => customer.phone)
        .map(customer => ({
          phone: customer.phone,
          message: campaign.smsContent,
        }));

      if (smsRecipients.length > 0) {
        const smsResults = await sendBatchSMS(
          smsRecipients,
          campaign.smsContent
        );
        smsSent = smsResults.sent;
        console.log(`📱 SMS sent: ${smsSent}/${smsResults.total}`);
      }
    }

    // Close MongoDB connection
    await mongoClient.close();

    // Update campaign performance metrics
    const totalSent = emailsSent + smsSent;
    campaign.performanceMetrics = {
      ...campaign.performanceMetrics,
      sent: (campaign.performanceMetrics.sent || 0) + totalSent,
      delivered: (campaign.performanceMetrics.delivered || 0) + totalSent,
    };

    await campaign.save();

    console.log(`✅ Campaign executed successfully: ${campaign.title}`);
    return { 
      success: true, 
      emailsSent, 
      smsSent, 
      totalCustomers: customers.length 
    };
  } catch (error) {
    console.error(`✗ Error executing campaign ${campaign.title}:`, error);
    if (mongoClient) {
      await mongoClient.close();
    }
    return { success: false, error: error.message };
  }
};
```

### Fix #2: Update Scheduler to Check Every 1 Minute

**File**: `backend/utils/campaignScheduler.js`

**Change**:
```javascript
// FROM:
const schedulerInterval = setInterval(runScheduledChecks, 5 * 60 * 1000);

// TO:
const schedulerInterval = setInterval(runScheduledChecks, 1 * 60 * 1000); // Every 1 minute
```

**Update console message**:
```javascript
console.log('📅 Campaign scheduler started - checking every 1 minute');
```

### Fix #3: Add MongoClient Import

**File**: `backend/utils/campaignScheduler.js`

**Add at top of file**:
```javascript
const { MongoClient } = require('mongodb');
```

---

## 📋 Testing Checklist

### Before Testing:
- [ ] Verify `.env` has `ENABLE_SCHEDULERS=true`
- [ ] Verify MongoDB connection details in `.env`
- [ ] Restart backend server

### Test Scenario 1: Campaign Executes at Scheduled Time
1. Create a campaign with start time **2 minutes from now**
2. Get it approved
3. Wait for scheduled time
4. **Expected**: Campaign auto-executes within 1 minute of scheduled time
5. **Expected**: Status changes from `approved` → `running`
6. **Expected**: Emails/SMS sent to targeted customers

### Test Scenario 2: Campaign with Past Start Time
1. Approve a campaign with start time in the past
2. Wait for scheduler cycle (1 minute)
3. **Expected**: Campaign executes immediately
4. **Expected**: Status changes to `running`

### Test Scenario 3: Multiple Campaigns
1. Create 3 campaigns with different start times (2 min, 5 min, 10 min from now)
2. Get all approved
3. **Expected**: Each executes at its own scheduled time
4. **Expected**: All transition to `running` at correct times

### Test Scenario 4: Campaign Completion
1. Have a running campaign with end time **2 minutes from now**
2. Wait for end time
3. **Expected**: Campaign auto-completes within 1 minute of end time
4. **Expected**: Status changes from `running` → `completed`

---

## 🚀 Implementation Steps

### Step 1: Update campaignScheduler.js
```bash
cd backend/utils
# Edit campaignScheduler.js with the fixes above
```

### Step 2: Update .env
```bash
# Add or verify this line exists:
ENABLE_SCHEDULERS=true
```

### Step 3: Restart Backend
```bash
cd backend
npm start
```

**Look for these logs**:
```
🔄 Starting internal schedulers...
📅 Campaign scheduler started - checking every 1 minute
📅 ML Customer segmentation scheduler started
🔄 Running scheduled campaign checks...
```

### Step 4: Test
1. Create a test campaign
2. Schedule it for 2 minutes from now
3. Get it approved
4. Monitor backend logs for execution

---

## 📊 Monitoring & Logs

### What to Watch in Backend Logs:

**Scheduler Running**:
```
🔄 Running scheduled campaign checks...
```

**Campaign Found & Starting**:
```
▶️ Started campaign: Test Campaign (ID: 507f1f77bcf86cd799439011)
🚀 Auto-executing campaign: Test Campaign (ID: 507f1f77bcf86cd799439011)
```

**Customer Fetch**:
```
📋 Fetching 25 targeted customers by IDs
   Found 25 customers in orders collection
📧 Found 25 customers for campaign execution
```

**Email/SMS Sending**:
```
✉️ Emails sent: 20/25
📱 SMS sent: 22/25
```

**Success**:
```
✅ Campaign executed successfully: Test Campaign
✓ Successfully started and executed 1 scheduled campaigns
```

### Error Indicators:

**No customers found**:
```
⚠️ No customers found for campaign: Test Campaign
```
→ Issue: Campaign has no `targetedCustomerIds` saved

**Mongo connection error**:
```
✗ Error executing campaign: MongoError: connection refused
```
→ Issue: Check MongoDB URI in `.env`

---

## 🎯 Summary

### Current State: ❌ Broken
- Auto-execution doesn't work
- Uses wrong database for customers
- Wrong timing for execution
- Scheduler might be disabled

### After Fixes: ✅ Working
- Campaigns auto-execute at scheduled time
- Fetches customers from correct database
- Executes within 1 minute of scheduled time
- Properly handles errors

### Recommended Priority:
1. **HIGH**: Fix #1 (Wrong database for customers) - **CRITICAL**
2. **HIGH**: Fix #3 (Add MongoClient import) - **REQUIRED FOR FIX #1**
3. **MEDIUM**: Fix #2 (Scheduler frequency) - **IMPROVES ACCURACY**
4. **MEDIUM**: Verify `.env` has `ENABLE_SCHEDULERS=true` - **REQUIRED TO RUN**

---

**Status**: ❌ Currently Not Working Properly  
**Estimated Fix Time**: 15-20 minutes  
**Testing Time**: 10-15 minutes  
**Priority**: **CRITICAL** - Core functionality broken
