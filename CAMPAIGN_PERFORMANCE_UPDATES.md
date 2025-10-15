# Campaign Performance Feature Updates

## Overview
The Campaign Performance section has been enhanced to provide comprehensive analytics with the ability to view overall performance across all campaigns and detailed metrics for individual completed campaigns.

## Changes Made

### Backend Changes

#### 1. Campaign Model (`backend/models/Campaign.js`)
- Added `performanceMetrics` field to store campaign performance data:
  - `sent`: Number of emails/messages sent
  - `delivered`: Number successfully delivered
  - `opened`: Number of opens
  - `clicked`: Number of clicks
  - `conversions`: Number of conversions
  - `bounced`: Number of bounced messages
  - `unsubscribed`: Number of unsubscribes
  - `revenue`: Revenue generated from campaign

#### 2. Campaign Controller (`backend/controllers/campaignController.js`)
Added new controller methods:
- `getOverallPerformance()`: Returns aggregated metrics across all campaigns including:
  - Total campaigns, active, and completed counts
  - Total sent, opened, clicked, conversions
  - Average open rate, click rate, conversion rate
  - Total revenue generated

- `getCompletedCampaignsPerformance()`: Returns all completed campaigns with calculated metrics:
  - Basic campaign info (title, dates)
  - Performance numbers (sent, opened, clicked, conversions, revenue)
  - Calculated rates (open rate, click rate, conversion rate)

- `updateCampaignMetrics()`: Allows updating performance metrics for a campaign

#### 3. Campaign Routes (`backend/routes/campaigns.js`)
Added new API endpoints:
- `GET /api/campaigns/performance/overall` - Get overall performance metrics
- `GET /api/campaigns/performance/completed` - Get all completed campaigns with metrics
- `PATCH /api/campaigns/:id/metrics` - Update campaign performance metrics

### Frontend Changes

#### Campaign Performance Component (`frontend/src/owner/CampaignPerformance.jsx`)
Complete redesign with the following features:

1. **Overall Performance Dashboard**
   - Displays aggregate metrics across all campaigns
   - Shows total campaigns, active campaigns, completed campaigns
   - Displays total revenue, total sent, average rates
   - Color-coded cards for different metric types

2. **Campaign Selection Dropdown**
   - Dropdown menu to select specific completed campaigns
   - Shows campaign title and completion date
   - Easy navigation between different campaigns

3. **Selected Campaign Details**
   - Detailed view of selected campaign's performance
   - Shows campaign dates (start, end, completed)
   - Displays all performance metrics with visual cards
   - Color-coded metrics (sent, opened, clicked, conversions)
   - Shows calculated rates (open rate, click rate, conversion rate)
   - Displays revenue if applicable

4. **All Completed Campaigns Table**
   - Comprehensive table of all completed campaigns
   - Sortable columns for easy comparison
   - Quick "View" button to select and view details
   - Shows key metrics in table format

5. **Responsive Design**
   - Mobile-friendly layout
   - Grid-based responsive design
   - Adapts to different screen sizes

### Utility Files

#### Seed Script (`backend/seedCampaignMetrics.js`)
- Seeds the database with sample campaign performance data
- Creates 5 sample completed campaigns if none exist
- Adds random realistic metrics to existing completed campaigns
- Useful for testing and demonstration

## How to Use

### 1. Set Up Performance Data

Run the seed script to add sample performance metrics:

```bash
cd backend
node seedCampaignMetrics.js
```

This will either:
- Create 5 sample completed campaigns with performance data, OR
- Add performance metrics to your existing completed campaigns

### 2. Start the Application

Make sure both backend and frontend are running:

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. View Performance Data

1. Navigate to the Campaign Performance page (Owner Dashboard → Campaign Performance)
2. View the overall performance summary at the top showing aggregate metrics
3. Use the dropdown to select a specific completed campaign
4. View detailed metrics for the selected campaign
5. Scroll down to see all completed campaigns in a table format
6. Click "View" on any campaign in the table to see its details

### 4. Update Performance Metrics (via API)

To update metrics for a campaign programmatically:

```javascript
// Update campaign metrics
fetch('http://localhost:5000/api/campaigns/{campaignId}/metrics', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    performanceMetrics: {
      sent: 5000,
      delivered: 4850,
      opened: 1250,
      clicked: 250,
      conversions: 100,
      revenue: 15000
    }
  })
});
```

## Features

### Overall Performance Metrics
- **Total Campaigns**: Count of all campaigns
- **Active Campaigns**: Currently running campaigns
- **Completed Campaigns**: Successfully finished campaigns
- **Total Revenue**: Sum of revenue from all campaigns
- **Total Sent**: Total messages sent across all campaigns
- **Average Open Rate**: Average percentage of opened messages
- **Average Click Rate**: Average percentage of clicked messages
- **Total Conversions**: Sum of conversions from all campaigns

### Individual Campaign Metrics
- **Sent**: Number of messages sent
- **Opened**: Number of messages opened (with open rate %)
- **Clicked**: Number of clicks (with click rate %)
- **Conversions**: Number of conversions (with conversion rate %)
- **Revenue**: Revenue generated from the campaign
- **Campaign Dates**: Start, end, and completion dates

## API Endpoints

### Get Overall Performance
```
GET /api/campaigns/performance/overall
```
Response:
```json
{
  "totalCampaigns": 10,
  "activeCampaigns": 2,
  "completedCampaigns": 8,
  "totalSent": 45000,
  "totalOpened": 13500,
  "totalClicked": 2700,
  "totalConversions": 810,
  "totalRevenue": 121500,
  "avgOpenRate": "30.00",
  "avgClickRate": "6.00",
  "avgConversionRate": "1.80"
}
```

### Get Completed Campaigns Performance
```
GET /api/campaigns/performance/completed
```
Response:
```json
[
  {
    "_id": "...",
    "title": "Summer Sale",
    "status": "completed",
    "completedAt": "2024-06-30T00:00:00.000Z",
    "startDate": "2024-06-01T00:00:00.000Z",
    "endDate": "2024-06-30T00:00:00.000Z",
    "sent": 5000,
    "opened": 1250,
    "clicked": 250,
    "conversions": 100,
    "revenue": 15000,
    "openRate": "25.00",
    "clickRate": "5.00",
    "conversionRate": "2.00"
  }
]
```

### Update Campaign Metrics
```
PATCH /api/campaigns/:id/metrics
```
Body:
```json
{
  "performanceMetrics": {
    "sent": 5000,
    "delivered": 4850,
    "opened": 1250,
    "clicked": 250,
    "conversions": 100,
    "bounced": 150,
    "unsubscribed": 25,
    "revenue": 15000
  }
}
```

## Future Enhancements

Potential improvements:
1. Add date range filtering for performance data
2. Export performance reports to PDF/Excel
3. Add charts and visualizations (line charts, pie charts)
4. Compare multiple campaigns side-by-side
5. Add email delivery status tracking
6. Real-time performance updates
7. Performance trends over time
8. A/B testing results comparison

## Notes

- All rates are calculated as percentages with 2 decimal places
- Revenue is displayed in USD currency format
- Dates are formatted in a user-friendly format (e.g., "Sep 15, 2024")
- The component handles loading and error states gracefully
- Performance data is fetched from the API when the component mounts
- The seed script adds realistic random data for testing purposes
