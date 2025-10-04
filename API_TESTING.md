# API Testing Guide

## Test Submit Campaign for Approval

Open a new PowerShell terminal and run:

```powershell
# Test submit endpoint
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/submit/68e1385561b0bef682934449" -Method PATCH
```

## Test Approve Campaign

```powershell
# First submit a campaign, then approve it
$campaignId = "68e1385561b0bef682934449"
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/approve/$campaignId" -Method PATCH
```

## Check Pending Campaigns

```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns?status=pending_approval"
```

## Full Test Flow

```powershell
# 1. Submit campaign
$submitResult = Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/submit/68e1385561b0bef682934449" -Method PATCH
Write-Host "Campaign submitted: $($submitResult.message)"

# 2. Check pending campaigns
$pending = Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns?status=pending_approval"
Write-Host "Pending campaigns: $($pending.total)"

# 3. Approve the campaign
$approveResult = Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns/approve/68e1385561b0bef682934449" -Method PATCH
Write-Host "Campaign approved: $($approveResult.message)"
```

## Frontend URLs

- Campaign Creation: http://localhost:5176/newcampaign
- Pending Approval: http://localhost:5176/pendingapproval (check your routes)

## API Endpoints

All endpoints now use the pattern `/action/:id` instead of `/:id/action`:

- POST   `/api/campaigns` - Create campaign
- PATCH  `/api/campaigns/autosave/:id` - Auto-save
- PATCH  `/api/campaigns/submit/:id` - Submit for approval
- PATCH  `/api/campaigns/approve/:id` - Approve campaign
- GET    `/api/campaigns?status=pending_approval` - Get pending campaigns
- GET    `/api/templates` - Get all templates
- POST   `/api/templates` - Create template
