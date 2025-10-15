# Railway Deployment Guide

## Problem: Backend Crashes with Internal Schedulers

Your backend was crashing on Railway because it runs **two internal schedulers**:
- **Campaign Scheduler**: Runs every 5 minutes
- **Segmentation Scheduler**: Runs every 1 minute

These constant background tasks consume resources and can cause crashes on Railway's free tier.

## Solution: Use Railway Cron Jobs

Instead of running schedulers inside your backend, use Railway's **Cron Jobs** feature to call API endpoints periodically.

---

## Step 1: Configure Environment Variables in Railway

Add these environment variables to your Railway backend service:

### Required Variables:
```env
# Database
MONGO_URI=your_mongodb_atlas_connection_string

# JWT
JWT_SECRET=your_secure_jwt_secret

# Email Service (for password reset, notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true

# Frontend URL (Railway URL or custom domain)
FRONTEND_URL=https://your-frontend-url.railway.app

# Node Environment
NODE_ENV=production

# DISABLE internal schedulers (important!)
ENABLE_SCHEDULERS=false

# Cron Security (optional but recommended)
CRON_SECRET=your_random_secure_string_here
```

### How to Generate CRON_SECRET:
```bash
# In terminal, run:
openssl rand -hex 32
```

---

## Step 2: Set Up Railway Cron Jobs

Railway allows you to create **separate cron services** that call your API endpoints on a schedule.

### Option A: Create Cron Service (Recommended)

1. **In Railway Dashboard**:
   - Click "New" → "Empty Service"
   - Name it: `marketing-cron-jobs`

2. **Add Environment Variables to Cron Service**:
   ```env
   BACKEND_URL=https://your-backend-url.railway.app
   CRON_SECRET=same_secret_from_backend
   ```

3. **Create a simple cron script** (create this file in your repo):

   **File: `cron-service/index.js`**
   ```javascript
   const cron = require('node-cron');
   const axios = require('axios');

   const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';
   const CRON_SECRET = process.env.CRON_SECRET;

   // Run all scheduled tasks every 5 minutes
   cron.schedule('*/5 * * * *', async () => {
     try {
       console.log('⏰ Running scheduled tasks...');
       const response = await axios.get(`${BACKEND_URL}/api/cron/all`, {
         headers: { 'x-cron-secret': CRON_SECRET }
       });
       console.log('✅ Success:', response.data);
     } catch (error) {
       console.error('❌ Error:', error.message);
     }
   });

   console.log('🚀 Cron service started - running every 5 minutes');

   // Keep the process alive
   setInterval(() => {}, 1000);
   ```

   **File: `cron-service/package.json`**
   ```json
   {
     "name": "cron-service",
     "version": "1.0.0",
     "scripts": {
       "start": "node index.js"
     },
     "dependencies": {
       "node-cron": "^3.0.3",
       "axios": "^1.6.0"
     }
   }
   ```

4. **Deploy the cron service**:
   - Point Railway to the `cron-service` directory
   - It will run continuously and trigger your backend endpoints

### Option B: Use Railway's Native Cron Schedule (Simpler)

1. **For each Railway service**, you can set a cron schedule:
   - Go to your service settings
   - Under "Deploy", find "Cron Schedule"
   - Enable it and set: `*/5 * * * *` (every 5 minutes)

2. **Add a startup script** that calls your cron endpoint:

   **File: `backend/cron-trigger.js`**
   ```javascript
   const axios = require('axios');

   const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';
   const CRON_SECRET = process.env.CRON_SECRET;

   async function triggerCron() {
     try {
       console.log('⏰ Triggering cron endpoint...');
       const response = await axios.get(`${BACKEND_URL}/api/cron/all`, {
         headers: { 'x-cron-secret': CRON_SECRET }
       });
       console.log('✅ Success:', response.data);
       process.exit(0);
     } catch (error) {
       console.error('❌ Error:', error.message);
       process.exit(1);
     }
   }

   triggerCron();
   ```

   **Update package.json**:
   ```json
   {
     "scripts": {
       "start": "node index.js",
       "cron": "node cron-trigger.js"
     }
   }
   ```

3. **In Railway**:
   - Create a new service
   - Set the start command to: `npm run cron`
   - Set cron schedule: `*/5 * * * *`

---

## Step 3: Available Cron Endpoints

Your backend now has these endpoints that Railway can call:

### 1. Run All Tasks (Recommended)
```
GET https://your-backend.railway.app/api/cron/all?secret=YOUR_CRON_SECRET
```
**Schedule**: Every 5 minutes (`*/5 * * * *`)

### 2. Campaign Tasks Only
```
GET https://your-backend.railway.app/api/cron/campaigns?secret=YOUR_CRON_SECRET
```
**Schedule**: Every 5 minutes (`*/5 * * * *`)

### 3. Segmentation Only
```
GET https://your-backend.railway.app/api/cron/segmentation?secret=YOUR_CRON_SECRET
```
**Schedule**: Every 5-10 minutes (`*/5 * * * *` or `*/10 * * * *`)

### 4. Health Check
```
GET https://your-backend.railway.app/api/cron/health
```

---

## Step 4: Local Development

For local development, you want to keep the internal schedulers enabled:

**In your local `.env` file:**
```env
ENABLE_SCHEDULERS=true
```

**In Railway (production):**
```env
ENABLE_SCHEDULERS=false
```

---

## Step 5: Testing

### Test the cron endpoints locally:
```bash
# Start your backend
npm start

# In another terminal, test the endpoint
curl http://localhost:5001/api/cron/all?secret=YOUR_CRON_SECRET
```

### Test on Railway:
```bash
curl https://your-backend.railway.app/api/cron/all?secret=YOUR_CRON_SECRET
```

---

## Cron Schedule Examples

Railway uses standard cron syntax:
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday = 0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**Common schedules:**
- `*/5 * * * *` - Every 5 minutes
- `*/10 * * * *` - Every 10 minutes
- `*/30 * * * *` - Every 30 minutes
- `0 * * * *` - Every hour
- `0 */2 * * *` - Every 2 hours
- `0 0 * * *` - Every day at midnight

---

## Benefits of This Approach

✅ **No crashes**: Backend doesn't run constant background processes
✅ **Better resource usage**: Only runs when needed
✅ **More reliable**: Railway cron jobs are designed for this use case
✅ **Easier debugging**: Clear logs for each cron execution
✅ **Scalable**: Easy to adjust frequency or add more tasks

---

## Troubleshooting

### Backend still crashing?
- Make sure `ENABLE_SCHEDULERS=false` in Railway
- Check Railway logs for errors
- Verify MongoDB Atlas connection string

### Cron jobs not working?
- Verify `CRON_SECRET` matches between backend and cron service
- Check that the `BACKEND_URL` is correct
- Look at cron service logs in Railway

### Tasks not running?
- Test the endpoints manually with curl
- Check backend logs to see if requests are received
- Verify cron schedule syntax

---

## Summary

**Before (causing crashes):**
- Backend runs schedulers every 1-5 minutes internally
- Consumes resources constantly
- Crashes on Railway

**After (stable):**
- Backend has no internal schedulers when `ENABLE_SCHEDULERS=false`
- Railway Cron Jobs call API endpoints on schedule
- Much more stable and resource-efficient

**Recommended Settings:**
- Main cron job: `*/5 * * * *` (every 5 minutes)
- Endpoint: `/api/cron/all`
- Security: Use `CRON_SECRET` header
