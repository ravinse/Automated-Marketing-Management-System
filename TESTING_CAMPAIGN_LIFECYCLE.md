# Testing Campaign Lifecycle - Step by Step Guide

## Prerequisites
- Backend server running on port 5001
- MongoDB connected
- At least one campaign in 'pending_approval' status

---

## Test Scenario: Complete Campaign Lifecycle

### Step 1: Approve a Campaign
```bash
# Get a pending campaign ID first
curl http://localhost:5001/api/campaigns?status=pending_approval

# Approve it (replace CAMPAIGN_ID with actual ID)
curl -X PATCH http://localhost:5001/api/campaigns/approve/CAMPAIGN_ID
```

**Expected Result:**
- Status changes from 'pending_approval' to 'approved'
- `approvedAt` timestamp is set
- Response: `{ "message": "Campaign approved successfully", ... }`

---

### Step 2: Start the Campaign
```bash
curl -X PATCH http://localhost:5001/api/campaigns/start/CAMPAIGN_ID
```

**Expected Result:**
- Status changes from 'approved' to 'running'
- Response: `{ "message": "Campaign started successfully", ... }`

**Possible Errors:**
- "Only approved campaigns can be started" - Campaign must be approved first
- "Start date and end date are required" - Campaign needs dates

---

### Step 3: Verify Running Campaign
```bash
# Get all running campaigns
curl http://localhost:5001/api/campaigns?status=running

# Get specific campaign
curl http://localhost:5001/api/campaigns/CAMPAIGN_ID
```

**Expected Result:**
- Campaign appears in running campaigns list
- Status is 'running'

---

### Step 4: Test Automatic Completion

#### Option A: Wait for Scheduler (5 min intervals)
1. Create a campaign with `endDate` in the past
2. Start the campaign
3. Wait up to 5 minutes
4. Campaign should automatically complete

#### Option B: Manually Trigger Check
```bash
curl -X POST http://localhost:5001/api/campaigns/check-expired
```

**Expected Result:**
```json
{
  "message": "Successfully completed 1 expired campaigns",
  "completedCampaigns": [
    {
      "id": "...",
      "title": "...",
      "endDate": "..."
    }
  ]
}
```

---

### Step 5: Test Manual Completion
```bash
curl -X PATCH http://localhost:5001/api/campaigns/complete/CAMPAIGN_ID
```

**Expected Result:**
- Status changes from 'running' to 'completed'
- `completedAt` timestamp is set
- Response: `{ "message": "Campaign completed successfully", ... }`

---

### Step 6: Verify Completed Campaign
```bash
# Get all completed campaigns
curl http://localhost:5001/api/campaigns?status=completed
```

**Expected Result:**
- Campaign appears in completed campaigns list
- Status is 'completed'
- `completedAt` field is populated

---

## Test Campaign Creation with Dates

Create a test campaign that will expire soon:

```bash
curl -X POST http://localhost:5001/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Campaign",
    "description": "Testing automatic completion",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-01T23:59:59.000Z",
    "status": "approved",
    "createdBy": "test@example.com",
    "emailSubject": "Test",
    "emailContent": "Test content"
  }'
```

---

## PowerShell Testing Commands

### Get Pending Campaigns
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns?status=pending_approval" -Method Get
```

### Approve Campaign
```powershell
$campaignId = "YOUR_CAMPAIGN_ID"
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/approve/$campaignId" -Method Patch
```

### Start Campaign
```powershell
$campaignId = "YOUR_CAMPAIGN_ID"
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/start/$campaignId" -Method Patch
```

### Get Running Campaigns
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns?status=running" -Method Get
```

### Check Expired Campaigns
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/check-expired" -Method Post
```

### Complete Campaign
```powershell
$campaignId = "YOUR_CAMPAIGN_ID"
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/complete/$campaignId" -Method Patch
```

### Get Completed Campaigns
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns?status=completed" -Method Get
```

---

## Testing the Scheduler

### Check Server Console
When the scheduler runs, you should see:
```
📅 Campaign scheduler started - checking every 5 minutes
✓ Completed campaign: Test Campaign (ID: 123456789)
✓ Successfully completed 1 expired campaigns
```

### Verify Scheduler is Working
1. Create a campaign with past `endDate`
2. Start the campaign (status: 'running')
3. Within 5 minutes, it should auto-complete
4. Check server console for completion message
5. Verify status is 'completed' in database

---

## Database Verification

### Using MongoDB Compass or Shell
```javascript
// Find all running campaigns
db.campaigns.find({ status: 'running' })

// Find expired running campaigns
db.campaigns.find({ 
  status: 'running',
  endDate: { $lte: new Date() }
})

// Find completed campaigns
db.campaigns.find({ status: 'completed' })

// Count campaigns by status
db.campaigns.countDocuments({ status: 'running' })
db.campaigns.countDocuments({ status: 'completed' })
```

---

## Common Issues and Solutions

### Issue: "Only approved campaigns can be started"
**Solution:** Make sure campaign status is 'approved' before starting
```bash
curl -X PATCH http://localhost:5001/api/campaigns/approve/CAMPAIGN_ID
```

### Issue: "Start date and end date are required"
**Solution:** Update campaign with dates before starting
```bash
curl -X PUT http://localhost:5001/api/campaigns/CAMPAIGN_ID \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-31T23:59:59.000Z"
  }'
```

### Issue: Scheduler not running
**Solution:** Check server console for startup message:
```
📅 Campaign scheduler started - checking every 5 minutes
```

If missing, restart the backend server.

### Issue: Campaign not auto-completing
**Checklist:**
1. ✓ Campaign status is 'running'
2. ✓ Campaign has `endDate` field set
3. ✓ Current date is past the `endDate`
4. ✓ Scheduler is running (check console)
5. ✓ Wait up to 5 minutes for next check

---

## Expected Timeline

```
0:00 - Create campaign (status: draft)
0:30 - Submit for approval (status: pending_approval)
1:00 - Manager approves (status: approved)
1:30 - Start campaign (status: running)
...
Campaign runs for duration (days/weeks)
...
END DATE PASSES
...
Within 5 minutes: Auto-complete (status: completed)
```

---

## Success Criteria

✅ Campaign approves successfully
✅ Campaign starts successfully (approved → running)
✅ Running campaigns appear in correct tables
✅ Scheduler runs every 5 minutes
✅ Expired campaigns auto-complete
✅ Completed campaigns appear in correct tables
✅ Manual completion works
✅ All status transitions follow the flow

---

## Next: Frontend Integration

After verifying backend works:
1. Create Running.jsx components (team member + manager)
2. Create Finished/Completed.jsx components
3. Add "Start Campaign" button in approved campaigns view
4. Test complete flow from frontend
5. Verify real-time updates when status changes
