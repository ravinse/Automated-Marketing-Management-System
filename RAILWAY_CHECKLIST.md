# Railway Deployment Checklist

Use this checklist to ensure your deployment is set up correctly.

---

## Pre-Deployment (Local Testing)

- [ ] **Verify local development works**
  ```bash
  cd backend
  npm start
  # Should see: "📅 Campaign scheduler started..."
  ```

- [ ] **Test cron endpoints locally**
  ```bash
  curl "http://localhost:5001/api/cron/health"
  curl "http://localhost:5001/api/cron/all"
  ```

- [ ] **Commit and push all changes**
  ```bash
  git add .
  git commit -m "Add Railway cron support"
  git push
  ```

---

## Railway Backend Service Setup

- [ ] **Create/Access your Railway backend service**

- [ ] **Set Environment Variables**
  ```env
  MONGO_URI=mongodb+srv://your_connection_string
  JWT_SECRET=your_jwt_secret
  NODE_ENV=production
  PORT=5001
  FRONTEND_URL=https://your-frontend-url.railway.app
  EMAIL_USER=your_email@gmail.com
  EMAIL_PASS=your_app_password
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=465
  SMTP_SECURE=true
  
  # CRITICAL: Disable internal schedulers
  ENABLE_SCHEDULERS=false
  
  # RECOMMENDED: Secure cron endpoints
  CRON_SECRET=generate_secure_random_string
  ```

- [ ] **Generate CRON_SECRET**
  ```bash
  # Run this in terminal to generate:
  openssl rand -hex 32
  ```

- [ ] **Deploy and verify**
  - Check deployment logs
  - Should see: "⚠️  Internal schedulers disabled..."

- [ ] **Get your backend URL**
  - Example: `https://your-backend.railway.app`
  - Save it for next steps

---

## Railway Cron Service Setup (Choose One Method)

### Method A: Railway Cron Service ⭐ Recommended

- [ ] **Create new Railway service**
  - Click "New" → Choose your repository
  - Name it: `marketing-cron-jobs`

- [ ] **Configure service settings**
  - Root directory: `/backend` (or leave default)
  - Start command: `npm run cron`

- [ ] **Add environment variables**
  ```env
  BACKEND_URL=https://your-backend.railway.app
  CRON_SECRET=same_secret_from_backend
  ```

- [ ] **Set cron schedule**
  - Go to service settings
  - Find "Cron Schedule" section
  - Enable it
  - Enter: `*/5 * * * *` (every 5 minutes)

- [ ] **Deploy the cron service**

### Method B: External Cron Service

- [ ] **Sign up for a free cron service**
  - [cron-job.org](https://cron-job.org) (Recommended)
  - [EasyCron](https://www.easycron.com)
  - Or use GitHub Actions

- [ ] **Create a new cron job**
  - URL: `https://your-backend.railway.app/api/cron/all?secret=YOUR_CRON_SECRET`
  - Method: GET
  - Schedule: Every 5 minutes

- [ ] **Test the cron job** (most services have a "test run" button)

---

## Verification & Testing

- [ ] **Check backend is running**
  ```bash
  curl https://your-backend.railway.app/
  # Should return: "Backend API is running..."
  ```

- [ ] **Test health endpoint**
  ```bash
  curl https://your-backend.railway.app/api/cron/health
  # Should return: {"status":"ok",...}
  ```

- [ ] **Test cron endpoint manually**
  ```bash
  curl "https://your-backend.railway.app/api/cron/all?secret=YOUR_CRON_SECRET"
  # Should return: {"success":true,...}
  ```

- [ ] **Check Railway logs**
  - Backend service: Should NOT show scheduler messages
  - Cron service: Should show successful calls every 5 minutes

- [ ] **Wait 5-10 minutes and check logs again**
  - Verify cron job is running automatically
  - Look for: "⏰ [Cron] Running all scheduled tasks"

---

## Database Verification

- [ ] **Check MongoDB Atlas**
  - Verify connection is working
  - Check that campaigns are being updated
  - Check that customers are being segmented

---

## Frontend Integration

- [ ] **Update frontend environment variables** (if needed)
  ```env
  VITE_API_BASE_URL=https://your-backend.railway.app/api
  ```

- [ ] **Deploy frontend to Railway**

- [ ] **Test full application flow**
  - Login works
  - Can create campaigns
  - Campaigns update status automatically
  - Customers are segmented

---

## Monitoring

- [ ] **Set up monitoring** (optional but recommended)
  - Railway provides basic metrics
  - Consider adding alerts for failures

- [ ] **Check logs regularly for first 24 hours**
  - Backend logs: No errors
  - Cron logs: Successful executions

---

## Troubleshooting Checklist

If something doesn't work:

- [ ] **Backend still crashing?**
  - ✅ Verify `ENABLE_SCHEDULERS=false` in Railway
  - ✅ Check Railway logs for errors
  - ✅ Verify MongoDB connection string

- [ ] **Cron jobs not running?**
  - ✅ Check cron service logs
  - ✅ Verify `BACKEND_URL` is correct
  - ✅ Verify `CRON_SECRET` matches
  - ✅ Test endpoint manually with curl

- [ ] **Tasks not executing?**
  - ✅ Check backend logs for requests
  - ✅ Verify cron schedule syntax
  - ✅ Check database for updated records

- [ ] **403 Forbidden errors?**
  - ✅ `CRON_SECRET` mismatch
  - ✅ Check header: `x-cron-secret`

---

## Success Criteria

Your deployment is successful when:

✅ Backend deploys without crashes
✅ No constant scheduler logs
✅ Cron endpoint responds successfully
✅ Automated tasks run every 5 minutes
✅ Campaigns are started/completed automatically
✅ Customers are segmented automatically
✅ Frontend can communicate with backend
✅ No errors in Railway logs

---

## Maintenance

### Weekly:
- [ ] Check Railway logs for errors
- [ ] Verify cron jobs are running
- [ ] Check database for data integrity

### Monthly:
- [ ] Review cron job frequency (adjust if needed)
- [ ] Check Railway usage/costs
- [ ] Update dependencies if needed

---

## Quick Commands Reference

```bash
# Local testing
npm start
curl http://localhost:5001/api/cron/all

# Test Railway endpoint
curl https://your-backend.railway.app/api/cron/health
curl "https://your-backend.railway.app/api/cron/all?secret=YOUR_SECRET"

# Check Railway logs
# Go to Railway dashboard → Service → Deployments → View logs

# Generate new CRON_SECRET
openssl rand -hex 32
```

---

## Need Help?

📚 **Documentation:**
- `RAILWAY_FIX_SUMMARY.md` - Overview of the fix
- `RAILWAY_DEPLOYMENT.md` - Detailed deployment guide
- `RAILWAY_QUICK_START.md` - Quick reference
- `RAILWAY_ARCHITECTURE.md` - Architecture diagrams

🔗 **Resources:**
- [Railway Documentation](https://docs.railway.app/)
- [Railway Cron Jobs](https://docs.railway.app/reference/cron-jobs)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)

---

**Last Updated:** Check the git commit date
**Next Review:** After first deployment

Good luck with your deployment! 🚀
