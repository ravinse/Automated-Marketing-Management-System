# Campaign Lifecycle - Backend Implementation Summary

## 🎯 What Was Implemented

### ✅ New API Endpoints (4)
1. **PATCH `/api/campaigns/start/:id`** - Start approved campaign (approved → running)
2. **PATCH `/api/campaigns/complete/:id`** - Manually complete campaign (running → completed)
3. **POST `/api/campaigns/check-expired`** - Check and complete expired campaigns
4. **PATCH `/api/campaigns/reject/:id`** - Reject pending campaign

### ✅ Automatic Scheduler
- **File:** `backend/utils/campaignScheduler.js`
- **Frequency:** Every 5 minutes
- **Purpose:** Auto-complete campaigns past their end date
- **Status:** Running on server startup

### ✅ Database Schema Updates
- Added `rejectedAt` field (Date)
- Added `rejectionReason` field (String)

---

## 📊 Campaign Status Flow

```
┌─────────┐
│  DRAFT  │ ← Team member creates campaign
└────┬────┘
     │ (Save as Draft)
     ↓
┌──────────────────┐
│ PENDING_APPROVAL │ ← Team member submits
└────┬────┬────────┘
     │    │
     │    └─────────────────┐
     ↓ (Manager Approves)   ↓ (Manager Rejects)
┌──────────┐          ┌──────────┐
│ APPROVED │          │ REJECTED │
└────┬─────┘          └──────────┘
     │ (Start Campaign - NEW!)
     ↓
┌─────────┐
│ RUNNING │ ← Shows in Running tables
└────┬────┘   (/thome & /campaign)
     │
     │ (After end date OR manual complete)
     ↓
┌───────────┐
│ COMPLETED │ ← Shows in Finished/Completed tables
└───────────┘   (/thome & /campaign)
```

---

## 🔄 How It Works

### When Campaign is Approved:
1. Manager clicks "Approve" on pending campaign
2. `PATCH /api/campaigns/approve/:id` is called
3. Campaign status: `pending_approval` → `approved`
4. Campaign appears in "Approved" table (if you create one)

### When Campaign is Started:
1. User/System clicks "Start Campaign" on approved campaign
2. `PATCH /api/campaigns/start/:id` is called
3. **Validation:** Campaign must be approved, must have startDate & endDate
4. Campaign status: `approved` → `running`
5. Campaign appears in **Running** table on `/thome` (team member)
6. Campaign appears in **Running** table on `/campaign` (manager)

### When Campaign Completes (Automatic):
1. Scheduler runs every 5 minutes
2. Finds campaigns where: `status='running'` AND `endDate <= now`
3. Updates each: `status='running'` → `completed`, sets `completedAt`
4. Campaign moves to **Finished** table on `/thome` (team member)
5. Campaign moves to **Completed** table on `/campaign` (manager)

### When Campaign Completes (Manual):
1. User clicks "Complete Campaign" button
2. `PATCH /api/campaigns/complete/:id` is called
3. Campaign status: `running` → `completed`
4. Same table movements as automatic completion

---

## 📁 Files Created/Modified

### Created Files:
```
backend/utils/campaignScheduler.js        (NEW - Scheduler utility)
CAMPAIGN_LIFECYCLE_BACKEND.md             (NEW - Full documentation)
API_CAMPAIGN_LIFECYCLE.md                 (NEW - API reference)
TESTING_CAMPAIGN_LIFECYCLE.md             (NEW - Testing guide)
```

### Modified Files:
```
backend/models/Campaign.js                (Updated schema)
backend/controllers/campaignController.js (Added 4 new functions)
backend/routes/campaigns.js               (Added 4 new routes)
backend/index.js                          (Integrated scheduler)
```

---

## 🧪 Testing Commands

### Start Backend Server
```powershell
cd backend
node index.js
```

**Expected Console Output:**
```
🚀 Server running on port 5001
📅 Campaign scheduler started - checking every 5 minutes
MongoDB Connected: ...
```

### Test Starting a Campaign
```powershell
# Replace CAMPAIGN_ID with actual ID
$campaignId = "YOUR_CAMPAIGN_ID"
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/start/$campaignId" -Method Patch
```

### Test Getting Running Campaigns
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns?status=running" -Method Get
```

### Test Manual Completion
```powershell
$campaignId = "YOUR_CAMPAIGN_ID"
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/complete/$campaignId" -Method Patch
```

### Test Getting Completed Campaigns
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns?status=completed" -Method Get
```

---

## 🎨 Frontend Integration Needed

### Team Member Pages (/thome)

#### 1. Running.jsx Component
```javascript
// Fetch running campaigns
const response = await fetch('http://localhost:5001/api/campaigns?status=running');
const data = await response.json();
setRunningCampaigns(data.items);
```

#### 2. Finished.jsx Component
```javascript
// Fetch completed campaigns
const response = await fetch('http://localhost:5001/api/campaigns?status=completed');
const data = await response.json();
setFinishedCampaigns(data.items);
```

#### 3. Update Home.jsx
```javascript
// Add running count
const runningResponse = await fetch('http://localhost:5001/api/campaigns?status=running');
const runningData = await runningResponse.json();
setRunningCount(runningData.total);

// Add finished count
const finishedResponse = await fetch('http://localhost:5001/api/campaigns?status=completed');
const finishedData = await finishedResponse.json();
setFinishedCount(finishedData.total);
```

### Marketing Manager Pages (/campaign)

#### 1. Create Running.jsx in Tables folder
```javascript
// Same as team member Running.jsx
```

#### 2. Update/Create Completed.jsx in Tables folder
```javascript
// Fetch completed campaigns
const response = await fetch('http://localhost:5001/api/campaigns?status=completed');
const data = await response.json();
setCompletedCampaigns(data.items);
```

---

## ⚡ Key Features

### 1. Automatic Completion
- ✅ No manual intervention needed
- ✅ Runs every 5 minutes
- ✅ Checks all running campaigns
- ✅ Completes those past end date
- ✅ Logs each completion to console

### 2. Manual Control
- ✅ Can manually start approved campaigns
- ✅ Can manually complete running campaigns
- ✅ Validation ensures proper status flow

### 3. Status Tracking
- ✅ All status changes timestamped
- ✅ `approvedAt` - when approved
- ✅ `completedAt` - when completed
- ✅ `submittedAt` - when submitted
- ✅ `rejectedAt` - when rejected (optional)

### 4. Flexible Querying
- ✅ Filter by status: `?status=running`
- ✅ Filter by creator: `?createdBy=email`
- ✅ Pagination support
- ✅ Sort by update time

---

## 📋 Next Steps

### Immediate (Backend Complete ✅)
- [x] Create API endpoints
- [x] Add scheduler utility
- [x] Update database schema
- [x] Integrate with server
- [x] Test all endpoints

### Frontend TODO
- [ ] Create Running.jsx (team member)
- [ ] Create Finished.jsx (team member)
- [ ] Create Running.jsx (manager)
- [ ] Update Completed.jsx (manager)
- [ ] Update Home.jsx with counts
- [ ] Add "Start Campaign" button
- [ ] Add "Complete Campaign" button (optional)
- [ ] Test complete workflow

---

## 🎯 Success Criteria

✅ **Backend:**
- Scheduler running every 5 minutes
- All API endpoints working
- Database schema updated
- Server integration complete

⏳ **Frontend:** (Next Phase)
- Running campaigns display correctly
- Completed campaigns display correctly
- Dashboard counts include running/finished
- Status transitions work end-to-end

---

## 📞 Support

**Documentation Files:**
- `CAMPAIGN_LIFECYCLE_BACKEND.md` - Comprehensive backend guide
- `API_CAMPAIGN_LIFECYCLE.md` - Quick API reference
- `TESTING_CAMPAIGN_LIFECYCLE.md` - Step-by-step testing guide

**Key Endpoints:**
- Start: `PATCH /api/campaigns/start/:id`
- Complete: `PATCH /api/campaigns/complete/:id`
- Get Running: `GET /api/campaigns?status=running`
- Get Completed: `GET /api/campaigns?status=completed`

---

## ✨ Backend Implementation Complete!

All backend functionality for campaign lifecycle management is now **fully implemented and tested**. The system is ready for frontend integration.

**Status:** 🟢 **BACKEND COMPLETE** - Ready for frontend development
