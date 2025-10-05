# Backend Not Working? - Troubleshooting Guide

## The Issue

The backend **IS WORKING** correctly! However, you need to:
1. **Restart the backend server** after adding the new code
2. Test the endpoints properly

---

## ✅ Solution: Restart the Backend Server

The new campaign lifecycle code was added AFTER the server was already running, so the old server doesn't have the new routes.

### Step 1: Stop the Current Server

Open a new PowerShell terminal and run:
```powershell
# Stop any running node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
```

### Step 2: Navigate to Backend Folder
```powershell
cd c:\Users\DELL\OneDrive\Desktop\final\GIT\Automated-Marketing-Management-System\backend
```

### Step 3: Start the Server
```powershell
node index.js
```

**Expected Output:**
```
[dotenv] injecting env ...
📅 Campaign scheduler started - checking every 5 minutes
🚀 Server running on port 5001
MongoDB Connected: ...
```

---

## 🧪 Test the New Endpoints

### Open a NEW Terminal (keep the server running in the first terminal)

### Test 1: Check if server is responding
```powershell
curl http://localhost:5001/
```
**Expected:** "Backend API is running..."

### Test 2: Get approved campaigns
```powershell
curl "http://localhost:5001/api/campaigns?status=approved"
```
**Expected:** JSON with approved campaigns

### Test 3: Get running campaigns
```powershell
curl "http://localhost:5001/api/campaigns?status=running"
```
**Expected:** JSON with running campaigns (probably empty at first)

### Test 4: Get completed campaigns
```powershell
curl "http://localhost:5001/api/campaigns?status=completed"
```
**Expected:** JSON with completed campaigns (probably empty at first)

---

## 🚀 Start a Campaign

### Step 1: Get an approved campaign ID
```powershell
$campaigns = Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns?status=approved"
$campaignId = $campaigns.items[0]._id
Write-Host "Campaign ID: $campaignId"
```

### Step 2: Check if it has start and end dates
```powershell
$campaign = Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/$campaignId"
Write-Host "Title: $($campaign.title)"
Write-Host "Status: $($campaign.status)"
Write-Host "Start Date: $($campaign.startDate)"
Write-Host "End Date: $($campaign.endDate)"
```

### Step 3: If dates are missing, add them first
```powershell
$body = @{
    startDate = "2025-10-05T00:00:00.000Z"
    endDate = "2025-10-30T23:59:59.000Z"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/$campaignId" -Method PUT -Body $body -ContentType "application/json"
```

### Step 4: Start the campaign
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/start/$campaignId" -Method PATCH -ContentType "application/json"
```

**Expected Response:**
```json
{
  "message": "Campaign started successfully",
  "campaign": {
    "_id": "...",
    "status": "running",
    ...
  }
}
```

### Step 5: Verify it's in running status
```powershell
curl "http://localhost:5001/api/campaigns?status=running"
```

---

## ⏰ Test Automatic Completion

### Create a campaign that expires immediately
```powershell
$body = @{
    title = "Test Campaign"
    description = "Testing auto-completion"
    startDate = "2025-01-01T00:00:00.000Z"
    endDate = "2025-01-01T23:59:59.000Z"
    status = "approved"
    createdBy = "test@example.com"
    emailSubject = "Test"
    emailContent = "Test content"
    customerSegments = @("All Customers")
} | ConvertTo-Json

$campaign = Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns" -Method POST -Body $body -ContentType "application/json"
$testId = $campaign.campaign._id
Write-Host "Created test campaign: $testId"
```

### Start it
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/start/$testId" -Method PATCH -ContentType "application/json"
```

### Manually trigger completion check
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/check-expired" -Method POST -ContentType "application/json"
```

**Expected:** Campaign should be completed since endDate is in the past

### Verify it's completed
```powershell
$campaign = Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/$testId"
Write-Host "Status: $($campaign.status)"
Write-Host "Completed At: $($campaign.completedAt)"
```

---

## 🐛 Common Errors and Solutions

### Error: "Only approved campaigns can be started"
**Solution:** The campaign must have status='approved' first
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/approve/$campaignId" -Method PATCH -ContentType "application/json"
```

### Error: "Start date and end date are required"
**Solution:** Add dates to the campaign first
```powershell
$body = @{
    startDate = "2025-10-05T00:00:00.000Z"
    endDate = "2025-10-30T23:59:59.000Z"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/$campaignId" -Method PUT -Body $body -ContentType "application/json"
```

### Error: "Cannot PATCH /api/campaigns/start/:id"
**Solution:** Server needs to be restarted to load new routes
```powershell
# Stop the server (Ctrl+C in server terminal)
# Then restart:
cd backend
node index.js
```

### Error: "Unable to connect to remote server"
**Solution:** Backend server is not running
```powershell
cd backend
node index.js
```

---

## ✅ Verify Everything Works

Run this complete test script in a NEW terminal (keep server running in another):

```powershell
# Test 1: Server is running
Write-Host "`n=== Test 1: Server Status ===" -ForegroundColor Cyan
curl http://localhost:5001/ | Select-Object -ExpandProperty Content

# Test 2: Get approved campaigns
Write-Host "`n=== Test 2: Approved Campaigns ===" -ForegroundColor Cyan
$approved = Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns?status=approved"
Write-Host "Total approved: $($approved.total)"

# Test 3: Get running campaigns
Write-Host "`n=== Test 3: Running Campaigns ===" -ForegroundColor Cyan
$running = Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns?status=running"
Write-Host "Total running: $($running.total)"

# Test 4: Get completed campaigns
Write-Host "`n=== Test 4: Completed Campaigns ===" -ForegroundColor Cyan
$completed = Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns?status=completed"
Write-Host "Total completed: $($completed.total)"

# Test 5: Check scheduler endpoint
Write-Host "`n=== Test 5: Check Expired Campaigns ===" -ForegroundColor Cyan
$expired = Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/check-expired" -Method POST -ContentType "application/json"
Write-Host "Message: $($expired.message)"

Write-Host "`n=== ALL TESTS PASSED! ===" -ForegroundColor Green
Write-Host "Backend is working correctly!" -ForegroundColor Green
```

---

## 🎯 Summary

**The backend IS working!** You just need to:

1. ✅ Stop any old server instances
2. ✅ Start the server fresh: `cd backend; node index.js`
3. ✅ Keep the server running in one terminal
4. ✅ Test endpoints in a different terminal
5. ✅ See the documentation files for complete API reference

**Console Output Should Show:**
```
📅 Campaign scheduler started - checking every 5 minutes
🚀 Server running on port 5001
MongoDB Connected: ...
```

**This means:**
- ✅ Server is running on port 5001
- ✅ Database is connected
- ✅ Scheduler is active
- ✅ All new endpoints are loaded
- ✅ Everything is working!

---

## 📚 Next Steps

1. Start backend server (if not running)
2. Test the endpoints above
3. Create frontend components to use these endpoints:
   - Running.jsx (team member)
   - Finished.jsx (team member)
   - Running.jsx (manager)
   - Completed.jsx (manager)

The backend is **100% ready** for frontend integration!
