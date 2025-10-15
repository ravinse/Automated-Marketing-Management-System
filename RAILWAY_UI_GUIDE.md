# Railway UI Configuration Guide

This guide shows you **exactly** what to do in Railway's dashboard.

---

## Step 1: Backend Service Configuration

### Navigate to Your Backend Service
1. Go to Railway dashboard: https://railway.app/
2. Select your project
3. Click on your backend service (or create new one)

### Add Environment Variables
Click on "Variables" tab and add these:

```
┌─────────────────────────────────────────────┐
│ Variable Name        │ Value                │
├─────────────────────────────────────────────┤
│ MONGO_URI           │ mongodb+srv://...    │
│ JWT_SECRET          │ your_jwt_secret      │
│ NODE_ENV            │ production           │
│ PORT                │ 5001                 │
│ FRONTEND_URL        │ https://your-fe...   │
│ EMAIL_USER          │ your_email@gmail...  │
│ EMAIL_PASS          │ your_app_password    │
│ SMTP_HOST           │ smtp.gmail.com       │
│ SMTP_PORT           │ 465                  │
│ SMTP_SECURE         │ true                 │
│                     │                      │
│ ⭐ ENABLE_SCHEDULERS │ false               │
│ ⭐ CRON_SECRET       │ (generate below)    │
└─────────────────────────────────────────────┘
```

### Generate CRON_SECRET
Open terminal and run:
```bash
openssl rand -hex 32
```
Copy the output and paste as `CRON_SECRET` value.

### Deploy Settings
- **Build Command**: (leave default or blank)
- **Start Command**: `npm start`
- **Root Directory**: `/backend` (if monorepo) or `/` (if backend only)

---

## Step 2: Get Your Backend URL

After deployment:
1. Go to your backend service
2. Click on "Settings" tab
3. Find "Domains" section
4. Copy the generated URL (e.g., `https://automated-marketing-production.up.railway.app`)
5. **Save this URL** - you'll need it for the cron job

---

## Step 3A: Railway Cron Service (Method 1 - Recommended)

### Create New Service
1. In your project, click "New" button (top right)
2. Select "GitHub Repo" (same repository)
3. Click "Add Service"

### Configure the Cron Service
**Service Name**: `marketing-cron-jobs`

**Environment Variables:**
```
┌─────────────────────────────────────────────┐
│ Variable Name    │ Value                    │
├─────────────────────────────────────────────┤
│ BACKEND_URL     │ https://your-backend... │
│ CRON_SECRET     │ (same as backend)       │
└─────────────────────────────────────────────┘
```

**Settings:**
- Root Directory: `/backend`
- Build Command: (leave default)
- Start Command: `npm run cron`

**Cron Schedule:**
1. Scroll down to "Cron Schedule" section
2. Toggle it ON
3. Enter: `*/5 * * * *`
4. (This means: run every 5 minutes)

### Visual Reference
```
┌────────────────────────────────────────┐
│ Settings                               │
├────────────────────────────────────────┤
│ Service Name: marketing-cron-jobs      │
│                                        │
│ Deploy Settings                        │
│ └─ Start Command: npm run cron        │
│                                        │
│ Cron Schedule                     [ON] │
│ └─ Schedule: */5 * * * *              │
│                                        │
│ Root Directory: /backend               │
└────────────────────────────────────────┘
```

---

## Step 3B: External Cron Service (Method 2 - Alternative)

### Using cron-job.org (Free)

1. **Sign up**: Go to https://cron-job.org/en/signup.php
2. **Create Account**: Free account allows 50 cron jobs
3. **Create New Cron Job**:

```
┌────────────────────────────────────────┐
│ Create New Cron Job                    │
├────────────────────────────────────────┤
│ Title: Marketing System Scheduler      │
│                                        │
│ URL: https://your-backend.railway.app/ │
│      api/cron/all?secret=YOUR_SECRET   │
│                                        │
│ Schedule:                              │
│ └─ Every 5 minutes                     │
│    [x] Minute: */5                     │
│    [ ] Hour: *                         │
│    [ ] Day: *                          │
│    [ ] Month: *                        │
│    [ ] Weekday: *                      │
│                                        │
│ Request Method: GET                    │
│                                        │
│ [Save] [Test]                          │
└────────────────────────────────────────┘
```

4. **Test the Job**: Click "Test" button to verify it works
5. **Enable**: Make sure the job is active

### Using EasyCron (Alternative)

1. **Sign up**: Go to https://www.easycron.com/user/register
2. **Create Cron Job**:
   - URL: `https://your-backend.railway.app/api/cron/all?secret=YOUR_SECRET`
   - Interval: Every 5 minutes
   - HTTP Method: GET

---

## Step 4: Verification

### Check Backend Deployment Logs
1. Go to backend service
2. Click "Deployments" tab
3. Click latest deployment
4. Check logs for:
   ```
   ✅ Server running on port 5001
   ✅ Database connected
   ⚠️  Internal schedulers disabled. Use cron jobs...
   ```

### Test Cron Endpoint Manually
In your terminal:
```bash
# Replace with your actual URL and secret
curl "https://your-backend.railway.app/api/cron/health"

# Should return: {"status":"ok",...}

curl "https://your-backend.railway.app/api/cron/all?secret=YOUR_CRON_SECRET"

# Should return: {"success":true,...}
```

### Monitor Cron Execution
Wait 5 minutes and check:

**Railway Cron Service Logs:**
```
✅ Response Status: 200
✅ Cron job completed successfully
```

**Backend Service Logs:**
```
⏰ [Cron] Running all scheduled tasks
✅ [Auto-Segmentation] All customers are already segmented
✓ Successfully completed 0 expired campaigns
```

---

## Step 5: Frontend Configuration

### Update Frontend Environment Variables
In your frontend Railway service:

```
┌─────────────────────────────────────────────┐
│ Variable Name           │ Value             │
├─────────────────────────────────────────────┤
│ VITE_API_BASE_URL      │ https://your-...  │
│                        │ backend.railway..  │
│                        │ .app/api          │
└─────────────────────────────────────────────┘
```

---

## Common Railway UI Locations

### Where to Find Things:

**Environment Variables:**
```
Project → Service → Variables (tab)
```

**Deployment Logs:**
```
Project → Service → Deployments (tab) → Click deployment → Logs
```

**Service Settings:**
```
Project → Service → Settings (tab)
```

**Cron Schedule:**
```
Project → Service → Settings (tab) → Scroll to "Cron Schedule"
```

**Service URL:**
```
Project → Service → Settings (tab) → Domains section
```

---

## Visual Checklist

```
Railway Dashboard Checklist:

Backend Service:
├─ [✓] Environment variables set
│   ├─ [✓] ENABLE_SCHEDULERS = false
│   └─ [✓] CRON_SECRET = generated
├─ [✓] Deployed successfully
├─ [✓] Logs show "schedulers disabled"
└─ [✓] URL copied for cron job

Cron Service (Method 1):
├─ [✓] New service created
├─ [✓] Environment variables set
│   ├─ [✓] BACKEND_URL = backend URL
│   └─ [✓] CRON_SECRET = same as backend
├─ [✓] Start command: npm run cron
├─ [✓] Cron schedule: */5 * * * *
└─ [✓] Deployed and running

OR External Cron (Method 2):
├─ [✓] Account created on cron service
├─ [✓] Cron job configured
├─ [✓] URL with secret added
├─ [✓] Schedule: every 5 minutes
├─ [✓] Test successful
└─ [✓] Job active

Verification:
├─ [✓] Manual curl test passed
├─ [✓] Health endpoint responds
├─ [✓] Cron logs show executions
└─ [✓] No crashes in backend logs
```

---

## Screenshot Reference Points

When following this guide, look for these in Railway UI:

1. **Left sidebar**: Project and service navigation
2. **Top tabs**: Variables, Deployments, Settings, Observability
3. **Variables tab**: Where you add environment variables
4. **Settings tab**: Where you find Domains and Cron Schedule
5. **Deployments tab**: Where you see logs and deployment history

---

## Need Help?

**Common Issues:**

❌ "Cannot find service"
→ Make sure you're in the correct project

❌ "Environment variable not found"
→ Check spelling, check you saved after adding

❌ "Cron not running"
→ Verify schedule format: `*/5 * * * *`

❌ "403 Forbidden"
→ CRON_SECRET mismatch between services

**Still stuck?** Check the other guides:
- RAILWAY_CHECKLIST.md
- RAILWAY_DEPLOYMENT.md
- RAILWAY_FIX_SUMMARY.md

---

**Happy Deploying!** 🚀
