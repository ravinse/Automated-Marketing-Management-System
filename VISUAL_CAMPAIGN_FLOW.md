# Campaign Lifecycle Visual Guide

## 📊 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CAMPAIGN LIFECYCLE                           │
└─────────────────────────────────────────────────────────────────────┘

USER ACTIONS                    STATUS                    WHERE IT SHOWS
─────────────                  ────────                  ──────────────

[Team Member]                   
Creates campaign        ───────▶ DRAFT         ───────▶  /thome - Drafted table
                                                         (Drafted.jsx)

[Team Member]
Clicks "Submit"        ───────▶ PENDING        ───────▶  /thome - Sent for Approval
                                APPROVAL                  (Sentapproval.jsx)
                                                         
                                                         /campaign - Pending Approval
                                                         (PendingApproval.jsx)

[Marketing Manager]               │                     
Reviews & Approves     ───────▶  │  ───────▶ APPROVED   (Future: Approved table)
                                  │
                                  │
                                  ↓
                                  
[Manager/Auto]                RUNNING        ───────▶  /thome - Running table
Starts campaign                                        (Running.jsx) ← NEED TO CREATE
(NEW ENDPOINT!)                                        
                                                       /campaign - Running table
                                                       (Tables/Running.jsx) ← NEED TO CREATE
                                  │
                                  │ (Campaign runs for set duration)
                                  │
                                  ↓
                                  
⏰ AUTOMATIC                      │
After end date passes             │
(Scheduler checks every 5 min)    │
                                  ↓
                                  
Status auto-changes    ───────▶ COMPLETED    ───────▶  /thome - Finished table
                                                       (Finished.jsx) ← NEED TO CREATE
                                                       
                                                       /campaign - Completed table
                                                       (Tables/Completed.jsx) ← UPDATE EXISTING


ALTERNATIVE PATH:
                       
[Marketing Manager]               │
Clicks "Reject"       ───────────▶ REJECTED
(Optional)                        (End state)
```

---

## 🔄 API Endpoints Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         API ENDPOINTS                               │
└─────────────────────────────────────────────────────────────────────┘

ACTION                          ENDPOINT                        STATUS CHANGE
──────                          ────────                        ─────────────

Submit for Approval    ───▶  PATCH /campaigns/submit/:id    ───▶  draft → pending_approval

Approve Campaign       ───▶  PATCH /campaigns/approve/:id   ───▶  pending_approval → approved

🆕 Start Campaign      ───▶  PATCH /campaigns/start/:id     ───▶  approved → running

🆕 Complete Campaign   ───▶  PATCH /campaigns/complete/:id  ───▶  running → completed

Reject Campaign        ───▶  PATCH /campaigns/reject/:id    ───▶  pending_approval → rejected


QUERY ENDPOINTS:

Get Running Campaigns  ───▶  GET /campaigns?status=running
Get Completed Camps    ───▶  GET /campaigns?status=completed
Get Approved Camps     ───▶  GET /campaigns?status=approved

🆕 Check Expired       ───▶  POST /campaigns/check-expired  ───▶  Auto-complete expired campaigns
```

---

## ⏰ Scheduler Timeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTOMATIC SCHEDULER                              │
└─────────────────────────────────────────────────────────────────────┘

SERVER STARTS
    │
    ▼
📅 Scheduler initialized
    │
    ▼
Run check immediately ──────────▶ Find running campaigns with endDate <= now
    │                            │
    │                            ▼
    │                            Complete those campaigns
    │
    ▼
⏰ Wait 5 minutes
    │
    ▼
Run check again ────────────────▶ Find running campaigns with endDate <= now
    │                            │
    │                            ▼
    │                            Complete those campaigns
    │
    ▼
⏰ Wait 5 minutes
    │
    ▼
(Repeats every 5 minutes)


Console Output:
────────────────
📅 Campaign scheduler started - checking every 5 minutes
✓ Completed campaign: Summer Sale (ID: 123456789)
✓ Successfully completed 1 expired campaigns
```

---

## 🗂️ Database Schema

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CAMPAIGN COLLECTION                             │
└─────────────────────────────────────────────────────────────────────┘

{
  _id: ObjectId,
  title: String ✓,
  description: String ✓,
  
  startDate: Date,           ← Required to start campaign
  endDate: Date,             ← Required to start campaign
  
  emailSubject: String,
  emailContent: String,
  smsContent: String,
  
  selectedFilters: [String],
  customerSegments: [String],
  
  status: String,            ← draft | pending_approval | approved | running | completed | rejected
  
  createdBy: String ✓,
  
  submittedAt: Date,         ← Set when status → pending_approval
  approvedAt: Date,          ← Set when status → approved
  🆕 rejectedAt: Date,       ← Set when status → rejected
  🆕 rejectionReason: String,← Reason for rejection
  completedAt: Date,         ← Set when status → completed
  
  createdAt: Date,           ← Auto by Mongoose
  updatedAt: Date            ← Auto by Mongoose
}
```

---

## 📂 File Structure

```
backend/
│
├── models/
│   └── Campaign.js                    [UPDATED] Added rejection fields
│
├── controllers/
│   └── campaignController.js          [UPDATED] Added 4 new functions:
│                                       • startCampaign()
│                                       • completeCampaign()
│                                       • checkAndCompleteExpiredCampaigns()
│                                       • rejectCampaign()
│
├── routes/
│   └── campaigns.js                   [UPDATED] Added 4 new routes
│
├── utils/
│   ├── generatePassword.js
│   └── campaignScheduler.js           [NEW] Scheduler utility
│
└── index.js                           [UPDATED] Integrated scheduler


frontend/
│
└── src/
    ├── team member/
    │   ├── Home.jsx                   [UPDATE] Add running & finished counts
    │   ├── Drafted.jsx                [EXISTING]
    │   ├── Sentapproval.jsx           [EXISTING]
    │   ├── Running.jsx                [CREATE] Show running campaigns
    │   └── Finished.jsx               [CREATE] Show completed campaigns
    │
    └── Tables/
        ├── PendingApproval.jsx        [EXISTING]
        ├── Running.jsx                [CREATE] Show running campaigns
        └── Completed.jsx              [UPDATE] Show completed campaigns
```

---

## 🎯 Status Validation Rules

```
┌─────────────────────────────────────────────────────────────────────┐
│                    STATUS TRANSITION RULES                          │
└─────────────────────────────────────────────────────────────────────┘

Can Start Campaign:
✓ Current status MUST be: approved
✓ Must have: startDate
✓ Must have: endDate
❌ Cannot start if: draft, pending_approval, running, completed, rejected

Can Complete Campaign:
✓ Current status CAN be: running OR approved
❌ Cannot complete if: draft, pending_approval, rejected, completed

Auto-Complete Eligible:
✓ Current status MUST be: running
✓ Current date MUST be: > endDate
❌ Will NOT auto-complete if: any other status

Can Reject Campaign:
✓ Current status SHOULD be: pending_approval
(Can technically reject any status, but makes most sense for pending)
```

---

## 🔍 Query Examples

```
┌─────────────────────────────────────────────────────────────────────┐
│                      QUERY PATTERNS                                 │
└─────────────────────────────────────────────────────────────────────┘

1. Get Running Campaigns for Dashboard Count:
   ─────────────────────────────────────────
   GET /api/campaigns?status=running
   
   Response: { items: [...], total: 5, page: 1, totalPages: 1 }
   Use: data.total for count


2. Get Completed Campaigns for Table:
   ──────────────────────────────────
   GET /api/campaigns?status=completed
   
   Response: { items: [...], total: 10, page: 1, totalPages: 1 }
   Use: data.items for table rows


3. Get All Campaigns by User:
   ──────────────────────────
   GET /api/campaigns?createdBy=user@example.com
   
   Response: All campaigns created by this user


4. Get Running Campaigns with Pagination:
   ──────────────────────────────────────
   GET /api/campaigns?status=running&page=1&limit=10
   
   Response: First 10 running campaigns
```

---

## 🚀 Quick Start Guide

### 1. Start Backend
```powershell
cd backend
node index.js
```

Expected Output:
```
🚀 Server running on port 5001
📅 Campaign scheduler started - checking every 5 minutes
MongoDB Connected: feedbackcluster.v9m9pp1.mongodb.net
```

### 2. Test Approve → Start Flow
```powershell
# Approve a campaign
$id = "YOUR_CAMPAIGN_ID"
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/approve/$id" -Method Patch

# Start the campaign
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/start/$id" -Method Patch

# Verify it's running
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns?status=running" -Method Get
```

### 3. Test Auto-Completion
```powershell
# Manually trigger check for expired campaigns
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/check-expired" -Method Post

# Or wait 5 minutes for automatic check
```

### 4. Verify Completed Campaigns
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns?status=completed" -Method Get
```

---

## ✅ Implementation Checklist

### Backend (COMPLETE ✅)
- [x] Campaign model updated with rejection fields
- [x] startCampaign() controller function
- [x] completeCampaign() controller function
- [x] checkAndCompleteExpiredCampaigns() controller function
- [x] rejectCampaign() controller function
- [x] All routes added and ordered correctly
- [x] Scheduler utility created
- [x] Scheduler integrated with server
- [x] No compilation errors
- [x] Documentation created

### Frontend (TODO)
- [ ] Create Running.jsx (team member)
- [ ] Create Finished.jsx (team member)
- [ ] Create Running.jsx (manager in Tables/)
- [ ] Update Completed.jsx (manager in Tables/)
- [ ] Update Home.jsx with running/finished counts
- [ ] Add "Start Campaign" button in approved view
- [ ] Test complete workflow

---

## 📚 Documentation Files

1. **CAMPAIGN_LIFECYCLE_BACKEND.md** - Comprehensive backend guide
2. **API_CAMPAIGN_LIFECYCLE.md** - Quick API reference
3. **TESTING_CAMPAIGN_LIFECYCLE.md** - Step-by-step testing
4. **BACKEND_SUMMARY.md** - Implementation summary
5. **VISUAL_CAMPAIGN_FLOW.md** - This file (visual guide)

---

## 🎉 Summary

✨ **Backend is 100% complete and ready for frontend integration!**

The system now supports:
- ✅ Automatic campaign completion based on end date
- ✅ Manual campaign start and completion
- ✅ Campaign rejection with reason
- ✅ Background scheduler running every 5 minutes
- ✅ All status transitions validated
- ✅ Comprehensive API endpoints
- ✅ Full documentation and testing guides

**Next Step:** Create frontend components to display running and completed campaigns!
