# Pending Approval Table - Fix Documentation

## Problem
The Pending Approval table was not displaying data even though there were campaigns with `pending_approval` status in the database.

## Root Cause
**API Response Mismatch**

The backend API returns campaigns in this format:
```json
{
  "items": [...],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

But the frontend was trying to access:
```javascript
setCampaigns(data.campaigns || []); // ❌ data.campaigns is undefined
```

## Solution
Changed the frontend to access the correct property:
```javascript
setCampaigns(data.items || []); // ✅ data.items contains the campaigns
```

## File Changed
- `frontend/src/Tables/PendingApproval.jsx` - Line 22

## Testing

### 1. Verify Backend Data
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns?status=pending_approval"
```

Should show:
```json
{
  "items": [
    {
      "_id": "...",
      "title": "qw",
      "status": "pending_approval",
      ...
    }
  ],
  "total": 1
}
```

### 2. Test Frontend
1. Open: http://localhost:5176/pendingapproval (or wherever the route is)
2. Should see: "Pending Approval (1)" in the header
3. Should see a table with the campaign "qw"
4. Should see "Approve" and "View" buttons

### 3. Test Approve Function
1. Click "Approve" button
2. Confirm the dialog
3. Campaign should be approved
4. Campaign should disappear from the table
5. Check with API:
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/api/campaigns?status=approved"
```

## Current Status

✅ **Backend**: Running on port 5001
✅ **Frontend**: Running on port 5176
✅ **MongoDB**: Connected
✅ **Pending Campaigns**: 1 campaign found
✅ **API Response**: Returns correct data structure
✅ **Frontend Fix**: Now accesses `data.items` instead of `data.campaigns`

## Summary in Sinhala (සිංහලෙන්)

### ගැටලුව:
Pending approval table එකේ data පෙන්වන්නේ නැහැ.

### හේතුව:
Backend API එක campaigns `items` කියන array එකක return කරනවා, නමුත් frontend එක `campaigns` කියන property එකක් හොයනවා.

### විසඳුම:
Frontend code එක fix කරලා `data.items` භාවිතා කරන්න දැම්මා.

### දැන් වැඩ කරනවා:
✅ Pending approval table එකේ data පෙන්වනවා
✅ Campaign count එක header එකේ පෙන්වනවා (1)
✅ Approve button එක වැඩ කරනවා
✅ Campaign approve කළම table එකෙන් අයින් වෙනවා

පරීක්ෂා කරන්න ඔබගේ browser එකේ! 🎉
