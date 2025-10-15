# 🚨 Railway "Application Failed to Respond" - Troubleshooting Guide

## Error Message
```
Application failed to respond
This error appears to be caused by the application.
```

This means your app deployed but isn't responding to HTTP requests.

---

## ✅ Quick Fixes (Try These First!)

### 1. Check Deploy Logs (MOST IMPORTANT!)

**In Railway Dashboard:**
1. Click your backend service
2. Go to **"Deployments"** tab  
3. Click the latest deployment
4. Click **"View Logs"**

**Look for these errors:**
- ❌ `MongoDB Connection Error` → Fix MongoDB (see below)
- ❌ `Error: listen EADDRINUSE` → Port conflict (rare on Railway)
- ❌ `Cannot find module` → Missing dependencies
- ❌ `SIGTERM` or crashes → Application error

---

### 2. Fix MongoDB Connection (Most Common Issue!)

#### Check MongoDB Atlas Network Access:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **"Network Access"** (left sidebar)
3. Click **"Add IP Address"**
4. Select **"Allow Access from Anywhere"**
5. Enter: `0.0.0.0/0`
6. Click **"Confirm"**
7. **Wait 2-3 minutes** for it to take effect

#### Verify Connection String:
Your `MONGO_URI` should look like this:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority
```

**Common mistakes:**
- ❌ Missing `/database_name` before the `?`
- ❌ Missing `?retryWrites=true&w=majority` at the end
- ❌ Special characters in password (like `@`, `!`, `#`) need URL encoding
- ❌ Wrong username/password
- ❌ Wrong cluster URL

#### URL Encode Special Characters in Password:
If your password has special characters, encode them:
- `@` → `%40`
- `!` → `%21`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`

---

### 3. Verify ALL Environment Variables in Railway

**Required Variables:**
```env
# Database (CRITICAL!)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Node Environment
NODE_ENV=production

# Scheduler Control
ENABLE_SCHEDULERS=false

# Email (optional but recommended)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true

# Frontend URL (optional)
FRONTEND_URL=https://your-frontend.railway.app
```

**DON'T set PORT** - Railway sets it automatically!

---

### 4. Check Service Settings

In Railway service settings:

**Root Directory:**
- If deploying from monorepo: `/backend`
- If backend is root: leave empty

**Start Command:**
- Default: `npm start`
- Alternative: `node index.js`

**Build Command:**
- Leave empty (npm install runs automatically)

---

## 🔍 Advanced Troubleshooting

### Check Deployment Status

**In Railway logs, look for:**

✅ **Good signs:**
```
🔌 Connecting to MongoDB...
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
🚀 Server running on port 5001
⚠️  Internal schedulers disabled. Use cron jobs or API endpoints to trigger tasks.
```

❌ **Bad signs:**
```
❌ MongoDB Connection Error: connect ECONNREFUSED
❌ FATAL: No MongoDB connection string found!
Error: listen EADDRINUSE: address already in use
```

---

### Test Your Endpoints

Once deployed, test these URLs (replace with your Railway URL):

```bash
# Health check
curl https://your-backend.railway.app/health

# Root endpoint
curl https://your-backend.railway.app/

# Cron health
curl https://your-backend.railway.app/api/cron/health
```

**Expected responses:**
- Root: `"Backend API is running..."`
- Health: `{"status":"ok","timestamp":"..."}`

---

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Timeout
**Error:** `MongoDB Connection Error: connect ETIMEDOUT`

**Solution:**
1. Add `0.0.0.0/0` to MongoDB Atlas Network Access
2. Wait 2-3 minutes
3. Redeploy in Railway

---

### Issue 2: Wrong Database Name
**Error:** App runs but no data shows up

**Solution:**
Check your `MONGO_URI` has the correct database name:
```
mongodb+srv://user:pass@cluster.mongodb.net/YOUR_DB_NAME_HERE?retryWrites=true
                                                    ^^^^^^^^^^^^^^^^
```

---

### Issue 3: Missing Environment Variables
**Error:** App crashes immediately

**Solution:**
1. Go to Railway service → Variables
2. Add ALL required variables (see list above)
3. Click **"Redeploy"**

---

### Issue 4: CORS Issues
**Error:** Frontend can't connect to backend

**Solution:**
Add `FRONTEND_URL` environment variable in Railway:
```env
FRONTEND_URL=https://your-frontend.railway.app
```

The updated code automatically handles CORS for this URL.

---

### Issue 5: Port Binding
**Error:** `Error: listen EADDRINUSE`

**Solution:**
Don't set `PORT` environment variable in Railway - it's automatic!
The code uses: `process.env.PORT || 5001`

---

## 📝 Deployment Checklist

- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0`
- [ ] `MONGO_URI` is correct with database name
- [ ] All environment variables set in Railway
- [ ] `ENABLE_SCHEDULERS=false` in Railway
- [ ] Root directory is `/backend` (if monorepo)
- [ ] Start command is `npm start`
- [ ] Deploy logs show "MongoDB Connected"
- [ ] Deploy logs show "Server running on port"
- [ ] Health endpoint responds: `/health`
- [ ] Root endpoint responds: `/`

---

## 🆘 Still Not Working?

### 1. Check Recent Changes
```bash
# Commit and push latest changes
git add .
git commit -m "Fix Railway deployment"
git push
```

### 2. Trigger Manual Redeploy
In Railway:
- Go to Deployments
- Click **"Redeploy"** on latest deployment

### 3. Check Railway Status
Visit: https://railway.app/status
(Rarely, Railway itself has issues)

### 4. Review Logs Again
Look for ANY error messages in:
- Build logs
- Deploy logs  
- Runtime logs

### 5. Test Locally First
```bash
# Make sure it works locally
cd backend
npm install
npm start

# Should see:
# ✅ MongoDB Connected
# 🚀 Server running on port 5001
```

---

## 🎯 Most Likely Causes (in order)

1. **MongoDB Network Access** (70% of issues)
   - Solution: Allow `0.0.0.0/0` in Atlas

2. **Wrong/Missing MONGO_URI** (20% of issues)
   - Solution: Check connection string format

3. **Missing Environment Variables** (5% of issues)
   - Solution: Add all required vars in Railway

4. **Code Errors** (5% of issues)
   - Solution: Check deploy logs for errors

---

## 📞 Getting Help

If still stuck:
1. Check Railway deploy logs (most important!)
2. Check MongoDB Atlas connection
3. Test endpoints with curl
4. Review all environment variables
5. Check Railway community: https://help.railway.app/

---

**Most issues are MongoDB connection problems - fix that first!** 🔧
