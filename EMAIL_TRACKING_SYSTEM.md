# Email Campaign Tracking System

## Features Implemented

### 1. Open Rate Tracking
Email තුලට invisible tracking pixel එකක් add කරල තියෙනවා. Customer email එක open කරනකොට automatic එකම open count එක increment වෙනවා.

### 2. Click Through Rate Tracking
Email තුල තියන හැම link එකක්ම automatically tracking link එකකට convert වෙනවා. Customer link එක click කරනකොට:
- Click count එක increment වෙනවා
- Original URL එකට redirect වෙනවා

### 3. Campaign Analytics
Campaign එකක් approve කරනකොට automatic එකම:
- Selected customer segments වලට emails යනවා
- Tracking system activate වෙනවා
- `sent`, `opened`, `clicked` counts track වෙනවා
- `openRate` සහ `clickThroughRate` percentages calculate වෙනවා

## API Endpoints

### Tracking Endpoints

#### 1. Track Email Open
```
GET /api/tracking/open/:campaignId/:customerId
```
මේක email තුලට invisible pixel එකක් විදිහට embed වෙනවා. Email open වුනම automatic call වෙනවා.

#### 2. Track Link Click
```
GET /api/tracking/click/:campaignId/:customerId?url=TARGET_URL
```
Email තුල තියන links මේ endpoint එක හරහා යනවා. Click කරනකොට track වෙලා original URL එකට redirect වෙනවා.

#### 3. Get Campaign Stats
```
GET /api/tracking/stats/:campaignId
```
Returns:
```json
{
  "campaignId": "...",
  "title": "Campaign Name",
  "sent": 100,
  "opened": 45,
  "clicked": 12,
  "openRate": "45.00%",
  "clickThroughRate": "12.00%",
  "trackingUrl": "https://example.com"
}
```

### Campaign Management Endpoints

#### 1. Send Campaign Emails
```
POST /api/campaigns/send-emails/:campaignId
```
Campaign එකක emails manually send කරන්න use කරන endpoint එක.

#### 2. Update Tracking URL
```
PATCH /api/campaigns/tracking-url/:campaignId
Body: { "trackingUrl": "https://your-website.com" }
```
Campaign එකට default redirect URL එකක් set කරන්න.

## Database Schema Updates

Campaign model එකට add වුන නව fields:

```javascript
{
  sent: Number,              // Total emails sent
  opened: Number,            // Total opens
  clicked: Number,           // Total clicks
  openRate: String,          // Percentage (e.g., "45.50%")
  clickThroughRate: String,  // Percentage (e.g., "12.30%")
  trackingUrl: String        // Default URL for click redirects
}
```

## Usage Flow

### 1. Campaign Creation
Campaign එකක් create කරද්දි `trackingUrl` field එකට redirect URL එක දාන්න පුළුවන්.

### 2. Campaign Approval
Owner campaign එක approve කරනකොට:
- Automatic emails යනවා customer segments වලට
- Each email වලට unique tracking links add වෙනවා
- `sent` count update වෙනවා

### 3. Customer Opens Email
Customer email එක open කරනකොට:
- Tracking pixel load වෙනවා
- `opened` count increment වෙනවා
- `openRate` calculate වෙනවා: `(opened / sent) * 100`

### 4. Customer Clicks Link
Customer email එකේ link එකක් click කරනකොට:
- `clicked` count increment වෙනවා
- `clickThroughRate` calculate වෙනවා: `(clicked / sent) * 100`
- Customer tracking URL එකට redirect වෙනවා

## Example Email Structure

Campaign approve කරනකොට email එක මෙහෙම වෙනවා:

```html
<html>
  <body>
    <h1>Welcome to Our Campaign!</h1>
    <p>Check out our <a href="http://localhost:5001/api/tracking/click/CAMPAIGN_ID/CUSTOMER_ID?url=https://example.com">latest products</a></p>
    
    <!-- Tracking pixel (invisible) -->
    <img src="http://localhost:5001/api/tracking/open/CAMPAIGN_ID/CUSTOMER_ID" width="1" height="1" style="display:none;" />
  </body>
</html>
```

## Configuration

`.env` file එකට add කරන්න:
```
BASE_URL=http://localhost:5001
```

Production එකට deploy කරද්දි:
```
BASE_URL=https://your-production-domain.com
```

## Testing

### 1. Test Email Open Tracking
```bash
curl http://localhost:5001/api/tracking/open/CAMPAIGN_ID/CUSTOMER_ID
```

### 2. Test Click Tracking
```bash
curl http://localhost:5001/api/tracking/click/CAMPAIGN_ID/CUSTOMER_ID?url=https://google.com
```

### 3. View Campaign Stats
```bash
curl http://localhost:5001/api/tracking/stats/CAMPAIGN_ID
```

## Notes

- Tracking pixels Gmail වගේ email clients වල block වෙන්න පුළුවන්
- Some email clients load images automatically, others need user permission
- Click tracking සැමවිටම work වෙනවා because it's a server-side redirect
- Rates automatically update real-time
- Each customer හට unique tracking links යනවා

## Future Enhancements

1. Track individual customer opens/clicks
2. Device/location tracking
3. Time-based analytics
4. A/B testing support
5. Unsubscribe tracking
