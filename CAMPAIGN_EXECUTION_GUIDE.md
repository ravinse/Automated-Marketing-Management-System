# Campaign Execution Guide

## Overview
The system now automatically executes marketing campaigns by sending emails and SMS to segmented customers using the campaign's title (email subject) and body (email/SMS content).

## How It Works

### 1. **Automatic Execution on Approval**
When a marketing manager approves a campaign:
- If the campaign's start date is **today or in the past**, the system:
  - ✅ Changes status to `running`
  - ✅ Immediately executes the campaign
  - ✅ Sends emails/SMS to all segmented customers
  - ✅ Updates performance metrics

- If the campaign's start date is **in the future**, the system:
  - ⏰ Changes status to `approved`
  - ⏰ Schedules the campaign to run automatically on the start date
  - ⏰ The scheduler will execute it when the time comes

### 2. **Scheduled Execution**
The campaign scheduler runs every **5 minutes** and:
- 🔍 Checks for approved campaigns that have reached their start date
- 🚀 Automatically starts and executes them
- 📧 Sends emails/SMS to targeted customers
- ✅ Marks expired campaigns as completed

### 3. **Manual Execution**
You can also manually execute a campaign via the API:
```bash
POST /api/campaigns/execute/:id
```

## Campaign Execution Process

### Step 1: Customer Segmentation
The system identifies targeted customers based on:
- **Customer IDs**: If specific customer IDs are provided in `targetedCustomerIds`
- **Customer Segments**: If segments are provided in `customerSegments` (e.g., "Premium", "Regular", "VIP")

### Step 2: Email Sending
If the campaign has `emailSubject` and `emailContent`:
- 📧 Filters customers who have email addresses
- 📧 Sends personalized emails using:
  - **Subject**: `campaign.emailSubject`
  - **Body**: `campaign.emailContent`
- 📧 Tracks sent/failed emails

### Step 3: SMS Sending
If the campaign has `smsContent`:
- 📱 Filters customers who have phone numbers
- 📱 Sends SMS messages using:
  - **Message**: `campaign.smsContent`
- 📱 Tracks sent/failed SMS

### Step 4: Performance Tracking
After execution, the system updates campaign metrics:
```javascript
performanceMetrics: {
  sent: 150,        // Total messages sent
  delivered: 148,   // Successfully delivered
  opened: 0,        // Will be tracked later
  clicked: 0,       // Will be tracked later
  conversions: 0,   // Will be tracked later
  revenue: 0        // Will be tracked later
}
```

## API Endpoints

### Execute Campaign (Manual)
```http
POST /api/campaigns/execute/:id
```

**Response:**
```json
{
  "message": "Campaign executed successfully",
  "campaign": { ... },
  "executionResults": {
    "totalCustomers": 100,
    "emails": {
      "sent": 95,
      "failed": 5,
      "total": 100
    },
    "sms": {
      "sent": 90,
      "failed": 10,
      "total": 100
    },
    "startedAt": "2025-10-15T10:00:00.000Z",
    "completedAt": "2025-10-15T10:05:00.000Z"
  }
}
```

### Approve Campaign (Auto-Execute)
```http
PATCH /api/campaigns/approve/:id
```

**Response (Immediate Execution):**
```json
{
  "message": "Campaign approved and executed successfully",
  "campaign": { ... },
  "execution": {
    "success": true,
    "emailsSent": 95,
    "smsSent": 90,
    "totalCustomers": 100
  }
}
```

**Response (Scheduled):**
```json
{
  "message": "Campaign approved and scheduled to start on 2025-10-20T09:00:00.000Z",
  "campaign": { ... }
}
```

## Campaign Requirements

For a campaign to be executed successfully, it must have:

1. ✅ **Status**: Must be `approved` or `running`
2. ✅ **Content**: Must have either:
   - Email subject + email content, OR
   - SMS content
3. ✅ **Targeting**: Must have either:
   - Targeted customer IDs, OR
   - Customer segments

## Email Configuration

The system uses **Nodemailer** to send emails. Configure these environment variables in `.env`:

```env
# Email Service Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=Marketing System
EMAIL_FROM=your-email@gmail.com
```

### Gmail Setup (for development)
1. Enable 2-Factor Authentication in your Google Account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `EMAIL_PASSWORD`

### Production Setup
For production, use professional email services:
- **SendGrid**: https://sendgrid.com/
- **AWS SES**: https://aws.amazon.com/ses/
- **Mailgun**: https://www.mailgun.com/
- **Postmark**: https://postmarkapp.com/

## SMS Configuration

The system includes an SMS service utility. Configure your SMS provider in `backend/utils/smsService.js`.

Popular SMS providers:
- **Twilio**: https://www.twilio.com/
- **AWS SNS**: https://aws.amazon.com/sns/
- **Nexmo/Vonage**: https://www.vonage.com/

## Scheduler Details

### Automatic Tasks
The scheduler performs these tasks every 5 minutes:

1. **Start Scheduled Campaigns**
   - Finds campaigns with status `approved` where `startDate <= now`
   - Changes status to `running`
   - Executes the campaign (sends emails/SMS)

2. **Complete Expired Campaigns**
   - Finds campaigns with status `running` where `endDate <= now`
   - Changes status to `completed`
   - Sets `completedAt` timestamp

### Manual Scheduler Endpoints
```http
# Manually trigger scheduled checks
POST /api/campaigns/check-expired
```

## Testing Campaign Execution

### Test with Segmented Customers

1. **Create customers with segments:**
```javascript
POST /api/customers
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "segment": "Premium"
}
```

2. **Create a campaign targeting the segment:**
```javascript
POST /api/campaigns
{
  "title": "Premium Sale",
  "description": "Exclusive sale for premium customers",
  "customerSegments": ["Premium"],
  "emailSubject": "🎉 Exclusive Premium Sale - 50% Off!",
  "emailContent": "<h1>Hello Premium Customer!</h1><p>Enjoy 50% off on all items...</p>",
  "smsContent": "Premium Sale: Get 50% off! Visit our store today.",
  "startDate": "2025-10-15T10:00:00.000Z",
  "endDate": "2025-10-20T18:00:00.000Z",
  "status": "pending_approval",
  "createdBy": "team-member-id"
}
```

3. **Approve the campaign:**
```javascript
PATCH /api/campaigns/approve/:campaignId
```

4. **Check execution logs in the console**

## Monitoring

### Console Logs
The system provides detailed console logs:
```
🚀 Auto-executing campaign: Premium Sale (ID: 67...)
📧 Found 100 customers for campaign execution
✉️ Emails sent: 95/100
📱 SMS sent: 90/100
✅ Campaign executed successfully: Premium Sale
```

### Performance Metrics
Track campaign performance through:
```http
GET /api/campaigns/:id
```

View the `performanceMetrics` object in the response.

## Troubleshooting

### Campaign Not Executing?
- ✅ Check campaign status (must be `approved` or `running`)
- ✅ Verify email/SMS content is present
- ✅ Confirm customers exist in targeted segments
- ✅ Check email configuration in `.env`
- ✅ Review console logs for errors

### Emails Not Sending?
- ✅ Verify EMAIL_* environment variables
- ✅ Test email configuration:
  ```javascript
  const { verifyEmailConfig } = require('./utils/emailService');
  verifyEmailConfig();
  ```
- ✅ Check for blocked ports (587, 465)
- ✅ Verify SMTP credentials

### No Customers Found?
- ✅ Verify customer segments match campaign segments exactly
- ✅ Check customer records have email/phone fields
- ✅ Confirm `targetedCustomerIds` or `customerSegments` are set

## Best Practices

1. **Test First**: Test with a small segment before launching large campaigns
2. **Schedule Wisely**: Set appropriate start dates for scheduled campaigns
3. **Monitor Performance**: Regularly check campaign metrics
4. **Backup Data**: Keep backups before major campaign launches
5. **Rate Limiting**: Be aware of email provider rate limits
6. **Compliance**: Follow email marketing laws (CAN-SPAM, GDPR)

## Future Enhancements

Potential improvements to consider:
- 📊 Email open/click tracking
- 🎯 A/B testing support
- 📈 Real-time analytics dashboard
- 🔄 Retry mechanism for failed sends
- 📝 Email templates with variables
- 🎨 Rich HTML email editor
- 📊 Advanced segmentation filters
- 🔔 Notification system for campaign events

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Review the campaign status and dates
3. Verify customer segmentation data
4. Test email configuration with a single email first
