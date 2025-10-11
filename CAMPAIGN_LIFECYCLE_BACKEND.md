# Campaign Lifecycle Backend - Complete Implementation

## Overview
This document describes the complete backend implementation for the campaign lifecycle management system, from approval through running to completion.

## Campaign Status Flow
```
draft → pending_approval → approved → running → completed
                                    ↓
                                rejected
```

## Database Schema Updates

### Campaign Model (`backend/models/Campaign.js`)
Added new fields:
- `rejectedAt`: Date - timestamp when campaign was rejected
- `rejectionReason`: String - reason for rejection

Status enum includes: `'draft'`, `'pending_approval'`, `'approved'`, `'running'`, `'completed'`, `'rejected'`

## API Endpoints

### 1. Start Campaign
**Endpoint:** `PATCH /api/campaigns/start/:id`

**Description:** Moves an approved campaign to running status

**Request:**
```javascript
PATCH /api/campaigns/start/123456789
```

**Validation:**
- Campaign must exist
- Campaign status must be 'approved'
- Start date and end date must be set

**Response:**
```json
{
  "message": "Campaign started successfully",
  "campaign": {
    "_id": "123456789",
    "title": "Summer Sale",
    "status": "running",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31",
    ...
  }
}
```

**Error Responses:**
- `404`: Campaign not found
- `400`: Only approved campaigns can be started
- `400`: Start date and end date are required

---

### 2. Complete Campaign Manually
**Endpoint:** `PATCH /api/campaigns/complete/:id`

**Description:** Manually complete a running or approved campaign

**Request:**
```javascript
PATCH /api/campaigns/complete/123456789
```

**Validation:**
- Campaign must exist
- Campaign status must be 'running' or 'approved'

**Response:**
```json
{
  "message": "Campaign completed successfully",
  "campaign": {
    "_id": "123456789",
    "status": "completed",
    "completedAt": "2025-01-31T23:59:59.000Z",
    ...
  }
}
```

**Error Responses:**
- `404`: Campaign not found
- `400`: Only running or approved campaigns can be completed

---

### 3. Check and Complete Expired Campaigns
**Endpoint:** `POST /api/campaigns/check-expired`

**Description:** Automatically find and complete all running campaigns where end date has passed

**Request:**
```javascript
POST /api/campaigns/check-expired
```

**Response:**
```json
{
  "message": "Successfully completed 3 expired campaigns",
  "completedCampaigns": [
    {
      "id": "123456789",
      "title": "Summer Sale",
      "endDate": "2025-01-31T00:00:00.000Z"
    },
    {
      "id": "987654321",
      "title": "Winter Campaign",
      "endDate": "2025-01-30T00:00:00.000Z"
    }
  ]
}
```

**How it works:**
1. Queries all campaigns with `status: 'running'` and `endDate <= now`
2. Updates each campaign to `status: 'completed'` and sets `completedAt: now`
3. Returns count and list of completed campaigns

---

### 4. Reject Campaign
**Endpoint:** `PATCH /api/campaigns/reject/:id`

**Description:** Reject a pending campaign with optional reason

**Request:**
```javascript
PATCH /api/campaigns/reject/123456789
Content-Type: application/json

{
  "reason": "Content needs revision"
}
```

**Response:**
```json
{
  "message": "Campaign rejected successfully",
  "campaign": {
    "_id": "123456789",
    "status": "rejected",
    "rejectedAt": "2025-01-15T10:30:00.000Z",
    "rejectionReason": "Content needs revision",
    ...
  }
}
```

---

## Automatic Campaign Completion Scheduler

### Scheduler Implementation (`backend/utils/campaignScheduler.js`)

**Purpose:** Automatically check and complete campaigns that have passed their end date

**Features:**
1. **checkAndCompleteExpiredCampaigns()** - Core function that:
   - Finds all running campaigns where `endDate <= now`
   - Updates status to 'completed'
   - Sets completedAt timestamp
   - Logs each completed campaign

2. **startCampaignScheduler()** - Starts the scheduler:
   - Runs immediately on server startup
   - Runs every 5 minutes (300,000ms)
   - Returns interval ID for cleanup

3. **stopCampaignScheduler(interval)** - Stops the scheduler:
   - Clears the interval
   - Used for graceful shutdown

**Scheduler Frequency:** Every 5 minutes (configurable)

**Console Output:**
```
📅 Campaign scheduler started - checking every 5 minutes
✓ Completed campaign: Summer Sale (ID: 123456789)
✓ Completed campaign: Winter Campaign (ID: 987654321)
✓ Successfully completed 2 expired campaigns
```

---

## Server Integration (`backend/index.js`)

The campaign scheduler is automatically started when the server starts:

```javascript
const { startCampaignScheduler } = require("./utils/campaignScheduler");

// Connect to DB
connectDB();

// Start campaign scheduler to auto-complete expired campaigns
startCampaignScheduler();
```

---

## Campaign Lifecycle Workflow

### 1. **Approval Flow**
```
Marketing Manager approves campaign
    ↓
PATCH /api/campaigns/approve/:id
    ↓
status: 'pending_approval' → 'approved'
approvedAt: now
    ↓
Campaign appears in "Approved" table
```

### 2. **Starting a Campaign**
```
User/System starts approved campaign
    ↓
PATCH /api/campaigns/start/:id
    ↓
Validates: status='approved', has startDate & endDate
    ↓
status: 'approved' → 'running'
    ↓
Campaign appears in "Running" table (/thome & /campaign)
```

### 3. **Automatic Completion**
```
Campaign scheduler runs (every 5 min)
    ↓
Queries: status='running' AND endDate <= now
    ↓
For each expired campaign:
    - status: 'running' → 'completed'
    - completedAt: now
    ↓
Campaign appears in "Finished"/"Completed" table (/thome & /campaign)
```

### 4. **Manual Completion**
```
User manually completes campaign
    ↓
PATCH /api/campaigns/complete/:id
    ↓
status: 'running' → 'completed'
completedAt: now
    ↓
Campaign appears in "Finished"/"Completed" table
```

---

## Frontend Integration Guide

### Fetching Running Campaigns
```javascript
// Team Member - Running campaigns on /thome
const fetchRunningCampaigns = async () => {
  const response = await fetch('http://localhost:5001/api/campaigns?status=running');
  const data = await response.json();
  setRunningCampaigns(data.items);
};

// Marketing Manager - Running campaigns on /campaign
const fetchRunningCampaigns = async () => {
  const response = await fetch('http://localhost:5001/api/campaigns?status=running');
  const data = await response.json();
  setRunningCampaigns(data.items);
};
```

### Fetching Completed Campaigns
```javascript
// Team Member - Finished campaigns on /thome
const fetchFinishedCampaigns = async () => {
  const response = await fetch('http://localhost:5001/api/campaigns?status=completed');
  const data = await response.json();
  setFinishedCampaigns(data.items);
};

// Marketing Manager - Completed campaigns on /campaign
const fetchCompletedCampaigns = async () => {
  const response = await fetch('http://localhost:5001/api/campaigns?status=completed');
  const data = await response.json();
  setCompletedCampaigns(data.items);
};
```

### Starting a Campaign
```javascript
const handleStartCampaign = async (campaignId) => {
  try {
    const response = await fetch(`http://localhost:5001/api/campaigns/start/${campaignId}`, {
      method: 'PATCH'
    });
    
    if (response.ok) {
      alert('Campaign started successfully!');
      // Refresh the campaigns list
      fetchApprovedCampaigns();
      fetchRunningCampaigns();
    } else {
      const error = await response.json();
      alert(error.message);
    }
  } catch (error) {
    console.error('Error starting campaign:', error);
    alert('Failed to start campaign');
  }
};
```

### Manually Completing a Campaign
```javascript
const handleCompleteCampaign = async (campaignId) => {
  if (!confirm('Are you sure you want to complete this campaign?')) return;
  
  try {
    const response = await fetch(`http://localhost:5001/api/campaigns/complete/${campaignId}`, {
      method: 'PATCH'
    });
    
    if (response.ok) {
      alert('Campaign completed successfully!');
      // Refresh the campaigns list
      fetchRunningCampaigns();
      fetchCompletedCampaigns();
    } else {
      const error = await response.json();
      alert(error.message);
    }
  } catch (error) {
    console.error('Error completing campaign:', error);
    alert('Failed to complete campaign');
  }
};
```

---

## Testing the Backend

### 1. Test Approving a Campaign
```bash
curl -X PATCH http://localhost:5001/api/campaigns/approve/CAMPAIGN_ID
```

### 2. Test Starting a Campaign
```bash
curl -X PATCH http://localhost:5001/api/campaigns/start/CAMPAIGN_ID
```

### 3. Test Getting Running Campaigns
```bash
curl http://localhost:5001/api/campaigns?status=running
```

### 4. Test Manual Completion
```bash
curl -X PATCH http://localhost:5001/api/campaigns/complete/CAMPAIGN_ID
```

### 5. Test Automatic Expiration Check
```bash
curl -X POST http://localhost:5001/api/campaigns/check-expired
```

### 6. Test Getting Completed Campaigns
```bash
curl http://localhost:5001/api/campaigns?status=completed
```

---

## Database Queries

### Find all running campaigns
```javascript
Campaign.find({ status: 'running' })
```

### Find all completed campaigns
```javascript
Campaign.find({ status: 'completed' })
```

### Find expired running campaigns
```javascript
Campaign.find({
  status: 'running',
  endDate: { $lte: new Date() }
})
```

### Count campaigns by status
```javascript
// Draft count
await Campaign.countDocuments({ status: 'draft' });

// Pending approval count
await Campaign.countDocuments({ status: 'pending_approval' });

// Approved count
await Campaign.countDocuments({ status: 'approved' });

// Running count
await Campaign.countDocuments({ status: 'running' });

// Completed count
await Campaign.countDocuments({ status: 'completed' });
```

---

## Important Notes

1. **Automatic Scheduler**: The scheduler runs every 5 minutes. Campaigns will be automatically completed within 5 minutes of their end date passing.

2. **Manual Override**: Campaigns can be manually completed at any time using the `/complete/:id` endpoint, regardless of the end date.

3. **Start Date Validation**: To start a campaign, both `startDate` and `endDate` must be set in the campaign document.

4. **Status Transitions**: 
   - Only 'approved' campaigns can be started
   - Only 'running' or 'approved' campaigns can be completed
   - The scheduler only affects 'running' campaigns

5. **Timestamps**: 
   - `approvedAt`: Set when status changes to 'approved'
   - `completedAt`: Set when status changes to 'completed'
   - `createdAt` & `updatedAt`: Automatically managed by Mongoose

6. **Performance**: The scheduler uses MongoDB queries with indexes on `status` and `endDate` fields for optimal performance.

---

## Next Steps for Frontend

1. **Create Running.jsx component** for team member (/thome)
2. **Create Finished.jsx component** for team member (/thome)
3. **Create Running.jsx component** in Tables folder for marketing manager (/campaign)
4. **Update Completed.jsx** in Tables folder for marketing manager (/campaign)
5. **Update Home.jsx** to show running and finished counts
6. **Add Start Campaign button** in approved campaigns view
7. **Add Complete Campaign button** in running campaigns view (optional)

---

## Files Modified/Created

### Created:
- `backend/utils/campaignScheduler.js` - Automatic campaign completion scheduler

### Modified:
- `backend/models/Campaign.js` - Added rejectedAt and rejectionReason fields
- `backend/controllers/campaignController.js` - Added startCampaign, completeCampaign, checkAndCompleteExpiredCampaigns, rejectCampaign
- `backend/routes/campaigns.js` - Added routes for start, complete, check-expired, reject
- `backend/index.js` - Integrated campaign scheduler on server startup

---

## Status Summary

✅ Backend fully implemented
✅ Campaign lifecycle: approved → running → completed
✅ Automatic completion scheduler running every 5 minutes
✅ Manual completion endpoint available
✅ All API endpoints tested and working
✅ Database schema updated with new fields
✅ Server integration complete

**Ready for frontend integration!**
