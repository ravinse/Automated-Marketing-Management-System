# Campaign Email Execution - Quick Reference

## ✅ What Was Implemented

When a marketing campaign is **approved** or **executed**, the system now:
1. ✉️ Sends emails to all customers in the selected segments
2. 📱 Sends SMS to all customers in the selected segments
3. 📧 Uses the campaign's **emailSubject** as the email title
4. 📝 Uses the campaign's **emailContent** as the email body
5. 📱 Uses the campaign's **smsContent** as the SMS message
6. 📊 Updates campaign performance metrics

## 🚀 How It Works

### Automatic Execution on Approval
```
Campaign Approved → Check Start Date
  ├─ If start date ≤ today: Execute immediately ✉️
  └─ If start date > today: Schedule for later ⏰
```

### Scheduled Execution
- Scheduler runs every **5 minutes**
- Automatically starts campaigns when start date arrives
- Automatically completes campaigns when end date passes

## 📋 Campaign Requirements

For emails to be sent, campaign must have:
- ✅ `emailSubject` (email title)
- ✅ `emailContent` (email body)
- ✅ `customerSegments` or `targetedCustomerIds`
- ✅ Status: `approved` or `running`

## 🔧 API Endpoints

### Approve Campaign (Auto-Execute)
```http
PATCH /api/campaigns/approve/:campaignId
```

### Execute Campaign Manually
```http
POST /api/campaigns/execute/:campaignId
```

## 📧 Email Configuration

Add to `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=Marketing System
EMAIL_FROM=your-email@gmail.com
```

## 🧪 Testing

### Quick Test:
```bash
cd backend
node test-campaign-execution.js
```

### Manual Test:
1. Create customers with segments (e.g., "Premium")
2. Create campaign with emailSubject, emailContent, and target segment
3. Approve the campaign
4. Check console logs for execution results

## 📊 Example Campaign Data

```json
{
  "title": "Summer Sale",
  "emailSubject": "🌞 Summer Sale - 50% Off!",
  "emailContent": "<h1>Hello!</h1><p>Get 50% off...</p>",
  "smsContent": "Summer Sale: 50% OFF! Use code SUMMER50",
  "customerSegments": ["Premium"],
  "startDate": "2025-10-15T10:00:00.000Z",
  "endDate": "2025-10-20T18:00:00.000Z"
}
```

## 📝 Console Logs to Expect

```
🚀 Auto-executing campaign: Summer Sale (ID: 67...)
📧 Email Subject: 🌞 Summer Sale - 50% Off!
📧 Targeting 100 customers
✉️ Emails sent: 95/100
📱 SMS sent: 90/100
✅ Campaign "Summer Sale" executed successfully!
```

## 🔍 Monitoring

Check campaign execution:
```http
GET /api/campaigns/:campaignId
```

View `performanceMetrics`:
```json
{
  "sent": 185,
  "delivered": 180,
  "opened": 0,
  "clicked": 0
}
```

## ⚠️ Troubleshooting

### Emails not sending?
- ✅ Check `.env` has EMAIL_* variables
- ✅ Verify SMTP credentials are correct
- ✅ Check console logs for errors

### Campaign not executing?
- ✅ Verify status is 'approved' or 'running'
- ✅ Check emailSubject and emailContent are set
- ✅ Confirm customers exist in target segments

## 📚 Documentation

- **Full Guide**: `CAMPAIGN_EXECUTION_GUIDE.md`
- **Implementation Details**: `CAMPAIGN_EMAIL_IMPLEMENTATION.md`
- **Test Script**: `backend/test-campaign-execution.js`

## ✨ Key Features

✅ Automatic execution on approval
✅ Scheduled execution for future campaigns
✅ Uses campaign title (emailSubject) for emails
✅ Uses campaign body (emailContent) for emails
✅ Segments customers properly
✅ Updates performance metrics
✅ Detailed console logging
✅ Batch sending with rate limiting

---

**Status**: ✅ Fully Implemented and Working

The system is now ready to automatically send emails to segmented customers when campaigns are executed!
