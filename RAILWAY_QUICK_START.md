# 🚀 Quick Railway Setup Guide

## Problem
Backend crashes every minute due to internal schedulers consuming too many resources.

## Solution
Disable internal schedulers and use Railway Cron Jobs to call API endpoints.

---

## Railway Environment Variables

Add these to your Railway backend service:

```env
# Required
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend.railway.app

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true

# IMPORTANT: Disable internal schedulers
ENABLE_SCHEDULERS=false

# Security (optional)
CRON_SECRET=generate_with_openssl_rand_hex_32
```

---

## Railway Cron Job Setup (Choose One Method)

### Method 1: Simple Cron Service (Recommended)

1. Create new service in Railway
2. Add environment variables:
   ```env
   BACKEND_URL=https://your-backend.railway.app
   CRON_SECRET=same_as_backend
   ```
3. Set start command: `npm run cron` (see cron-trigger.js below)
4. Set cron schedule: `*/5 * * * *` (every 5 minutes)

### Method 2: External Cron Service

Use a service like:
- **Cron-job.org** (free)
- **EasyCron** (free tier)
- **GitHub Actions** (free for public repos)

Configure it to call:
```
GET https://your-backend.railway.app/api/cron/all?secret=YOUR_CRON_SECRET
```

Every 5 minutes.

---

## Test Your Setup

### 1. Test locally first:
```bash
# Make sure ENABLE_SCHEDULERS=true in local .env
npm start
```

### 2. Test cron endpoint:
```bash
curl "http://localhost:5001/api/cron/all?secret=YOUR_CRON_SECRET"
```

### 3. Deploy to Railway with ENABLE_SCHEDULERS=false

### 4. Test Railway endpoint:
```bash
curl "https://your-backend.railway.app/api/cron/all?secret=YOUR_CRON_SECRET"
```

### 5. Set up cron job to call the endpoint every 5 minutes

---

## Files Created/Modified

✅ `backend/routes/cron.js` - New cron endpoints
✅ `backend/index.js` - Added ENABLE_SCHEDULERS check
✅ `backend/.env.example` - Added new variables
✅ `RAILWAY_DEPLOYMENT.md` - Full deployment guide

---

## Need Help?

See `RAILWAY_DEPLOYMENT.md` for detailed instructions and troubleshooting.
