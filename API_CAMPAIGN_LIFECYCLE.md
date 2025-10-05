# Campaign Lifecycle API - Quick Reference

## New API Endpoints

### 1. Start Campaign
**Moves approved campaign to running status**
```
PATCH /api/campaigns/start/:id
```
**Requirements:**
- Campaign must be approved
- Must have startDate and endDate

**Response:**
```json
{
  "message": "Campaign started successfully",
  "campaign": { ... }
}
```

---

### 2. Complete Campaign
**Manually complete a running campaign**
```
PATCH /api/campaigns/complete/:id
```
**Requirements:**
- Campaign must be running or approved

**Response:**
```json
{
  "message": "Campaign completed successfully",
  "campaign": { ... }
}
```

---

### 3. Check Expired Campaigns
**Auto-complete all campaigns past their end date**
```
POST /api/campaigns/check-expired
```
**No parameters required**

**Response:**
```json
{
  "message": "Successfully completed 3 expired campaigns",
  "completedCampaigns": [ ... ]
}
```

---

### 4. Reject Campaign
**Reject a pending campaign**
```
PATCH /api/campaigns/reject/:id
Body: { "reason": "optional reason" }
```

**Response:**
```json
{
  "message": "Campaign rejected successfully",
  "campaign": { ... }
}
```

---

## Existing Endpoints (for reference)

### Get Campaigns by Status
```
GET /api/campaigns?status=running
GET /api/campaigns?status=completed
GET /api/campaigns?status=approved
```

### Approve Campaign
```
PATCH /api/campaigns/approve/:id
```

---

## Automatic Scheduler

**Running:** Every 5 minutes
**Purpose:** Auto-complete campaigns past their end date
**Target:** Campaigns with `status='running'` and `endDate <= now`

---

## Campaign Status Flow

```
draft 
  ↓
pending_approval (Submit for Approval)
  ↓
approved (Manager Approves)
  ↓
running (Start Campaign)
  ↓
completed (Auto/Manual Complete)
```

---

## Frontend Integration Examples

### Fetch Running Campaigns
```javascript
const response = await fetch('http://localhost:5001/api/campaigns?status=running');
const data = await response.json();
console.log(data.items); // Array of running campaigns
```

### Fetch Completed Campaigns
```javascript
const response = await fetch('http://localhost:5001/api/campaigns?status=completed');
const data = await response.json();
console.log(data.items); // Array of completed campaigns
```

### Start a Campaign
```javascript
const response = await fetch(`http://localhost:5001/api/campaigns/start/${campaignId}`, {
  method: 'PATCH'
});
const data = await response.json();
console.log(data.message); // "Campaign started successfully"
```

### Complete a Campaign
```javascript
const response = await fetch(`http://localhost:5001/api/campaigns/complete/${campaignId}`, {
  method: 'PATCH'
});
const data = await response.json();
console.log(data.message); // "Campaign completed successfully"
```

---

## Next Steps

1. Create frontend components:
   - Team Member: Running.jsx, Finished.jsx (/thome)
   - Marketing Manager: Running.jsx, Completed.jsx (/campaign)

2. Update dashboard counts:
   - Home.jsx to show running count
   - Home.jsx to show finished count

3. Add action buttons:
   - "Start Campaign" in approved campaigns view
   - "Complete Campaign" in running campaigns view (optional)

4. Test the complete flow:
   - Approve → Start → Auto-complete after end date
   - Verify campaigns show in correct tables
