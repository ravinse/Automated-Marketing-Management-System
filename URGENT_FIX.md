# URGENT: Backend Restart Required

## The Problem
You're seeing **"0 customers"** when selecting segments because the new API routes haven't been loaded yet.

## The Solution (2 Minutes)

### Step 1: Restart Backend
1. Go to the terminal running `backend`
2. Press `Ctrl+C` to stop it
3. Run: `npm start` (or `npm run dev`)
4. Wait for: `🚀 Server running on port 5001`

### Step 2: Verify It's Working
Run this command:
```bash
./check_segmentation.sh
```

You should see:
```
✅ Backend Server: Running
✅ Segmentation API: Loaded
✅ Customer Data: Found XXXX customers
✅ Filtering Logic: Working
```

### Step 3: Test in Browser
1. Refresh the Campaign Creation page
2. Select a customer segment
3. You should now see customer count!

## Why This Happened
The segmentation controller and routes were just added to the code. Node.js servers need to be restarted to load new route files.

## Quick Test
After restarting, run:
```bash
curl http://localhost:5001/api/segmentation/stats
```

If you see JSON data → It's working! ✅
If you see HTML error → Backend needs restart ❌

## Need More Help?
- See `TROUBLESHOOTING.md` for detailed diagnostics
- Check browser console (F12) for specific errors
- Review backend terminal for error messages
