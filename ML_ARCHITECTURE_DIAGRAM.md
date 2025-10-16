# ML Segmentation Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
├─────────────────────────────────────────────────────────────────┤
│  CreatecampaingM.jsx          CreatecampaingT.jsx              │
│         │                              │                        │
│         └──────────────┬───────────────┘                        │
│                        │                                         │
│                        ▼                                         │
│           POST /api/ml/segmentation/filtered-customers          │
└────────────────────────┼────────────────────────────────────────┘
                         │
                         │ HTTP Request
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  index.js                                                        │
│    ├── startSegmentationScheduler() ◄─── ml/segmentationScheduler.js
│    └── app.use("/api/ml", mlRoutes) ◄─── routes/ml.js          │
│                                              │                   │
│                                              ▼                   │
│                                     ml/segmentationController.js │
│                                              │                   │
│                                              │ Uses              │
│                                              ▼                   │
│                                     ml/autoSegmentation.js       │
│                                     (ML Algorithms)              │
│                                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ MongoDB Queries
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB Atlas                              │
├─────────────────────────────────────────────────────────────────┤
│  Database: retail_db                                            │
│    ├── Collection: customer_segmentation                        │
│    │    └── Documents: { customer_id, segmentation: {...} }     │
│    └── Collection: newdatabase (orders)                         │
│         └── Documents: { customer_id, order_date, email, ... }  │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

### 1. Campaign Creation Flow
```
User Selects Segments
        │
        ▼
Frontend (CreatecampaingM.jsx)
        │
        │ POST /api/ml/segmentation/filtered-customers
        │ { customerSegments: [...], daysPeriod: 14 }
        ▼
Backend (routes/ml.js)
        │
        ▼
ML Controller (ml/segmentationController.js)
        │
        │ - Build MongoDB query
        │ - Apply segment filters
        │ - Apply date filters
        │
        ▼
MongoDB Query Execution
        │
        │ - Query customer_segmentation collection
        │ - Join with orders collection
        │ - Enrich customer data
        │
        ▼
Response to Frontend
        │
        │ { success: true, customers: [...], count: N }
        ▼
Update Campaign Form
        │
        ▼
Save Customer IDs to Campaign
```

### 2. Auto-Segmentation Flow (Scheduled)
```
Scheduler Triggers (Every 1 minute)
        │
        ▼
ml/segmentationScheduler.js
        │
        ▼
ml/autoSegmentation.js
        │
        │ Step 1: Get all customer IDs from orders
        │ Step 2: Get existing segmented customers
        │ Step 3: Find new customers (difference)
        ▼
For Each New Customer:
        │
        │ - Fetch all orders for customer
        │ - Apply ML algorithms:
        │   ├── determinePurchaseFrequency()
        │   ├── determineSpendingLevel()
        │   └── determineCategoryPreference()
        │
        ▼
Build Segmentation Document
        │
        │ { customer_id, segmentation: {
        │     purchase_frequency: "Loyal",
        │     spending: "High Value Customer",
        │     category: "Mens"
        │   }, created_at, last_updated }
        ▼
Batch Insert to customer_segmentation
        │
        ▼
Log Summary & Complete
```

## ML Segmentation Logic

### Purchase Frequency Algorithm
```
┌─────────────────────────────────────┐
│  Analyze Customer Order History     │
└──────────────┬──────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Calculate Metrics:   │
    │ - Total orders       │
    │ - Days since last    │
    │ - Days since first   │
    │ - Order pattern      │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────────────────┐
    │ Apply Rules:                     │
    │                                  │
    │ IF 1 order & ≤30 days → "New"   │
    │ IF last order >180 days → "Lapsed" │
    │ IF ≥5 orders & >90 days → "Loyal"  │
    │ IF seasonal pattern → "Seasonal"   │
    │ ELSE → "New"                      │
    └──────────┬───────────────────────┘
               │
               ▼
         Segment Assigned
```

### Spending Level Algorithm
```
┌─────────────────────────────────────┐
│  Calculate Customer Spending        │
└──────────────┬──────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Sum all orders:      │
    │ - total_amount_lkr   │
    │ - order_amount       │
    │ - price_lkr          │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Calculate:           │
    │ - Total spending     │
    │ - Average per order  │
    └──────────┬───────────┘
               │
               ▼
    ┌─────────────────────────────────────────┐
    │ Apply Thresholds:                       │
    │                                         │
    │ IF total ≥50k OR avg ≥20k              │
    │    → "High Value Customer"              │
    │ ELSE IF total ≥10k OR avg ≥3k          │
    │    → "Medium Value"                     │
    │ ELSE                                    │
    │    → "Low Value Customer"               │
    └──────────┬──────────────────────────────┘
               │
               ▼
         Segment Assigned
```

### Category Preference Algorithm
```
┌─────────────────────────────────────┐
│  Analyze Product Purchases          │
└──────────────┬──────────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ Extract Categories:          │
    │ - product_category           │
    │ - category                   │
    │ - clothing_category          │
    │ - gender (fallback)          │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ Normalize & Count:           │
    │ - "men/male" → Mens          │
    │ - "women/female" → Womens    │
    │ - "kid/child" → Kids         │
    │ - Other → Family             │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ IF purchases from >2 categories │
    │    → "Family"                │
    │ ELSE                         │
    │    → Most frequent category  │
    └──────────┬───────────────────┘
               │
               ▼
         Segment Assigned
```

## API Endpoints Architecture

```
/api/ml/
    └── segmentation/
            ├── GET  /available-segments
            │        └── Returns: Segment counts by type
            │
            ├── POST /filtered-customers
            │        ├── Input: { customerSegments, daysPeriod }
            │        └── Returns: Filtered customer list
            │
            ├── POST /customers-by-ids
            │        ├── Input: { customerIds: [] }
            │        └── Returns: Customer details
            │
            ├── POST /preview-count
            │        ├── Input: { customerSegments, daysPeriod }
            │        └── Returns: Count & breakdown
            │
            ├── GET  /stats
            │        └── Returns: Overall segmentation statistics
            │
            └── POST /sync
                     └── Returns: Manual sync trigger result
```

## File Structure

```
backend/
├── index.js ──────────────────┐
│                              │
├── routes/                    │
│   └── ml.js ─────────────┐  │
│                           │  │
├── ml/ ◄─────────────────┐│  │
│   ├── segmentationController.js ◄──┘
│   ├── autoSegmentation.js     │
│   ├── segmentationScheduler.js ◄───┘
│   └── README.md
│
└── config/
    └── db.js (MongoDB connection)

frontend/
└── src/
    ├── Marketingmanager/
    │   └── CreatecampaingM.jsx ─┐
    └── team member/              │
        └── CreatecampaingT.jsx ──┴─► Calls /api/ml/segmentation/*
```

## Data Flow Diagram

```
┌───────────────┐
│  Orders DB    │
│  (Source)     │
└───────┬───────┘
        │
        │ New customers detected
        ▼
┌───────────────────┐
│  ML Scheduler     │◄──── Runs every 1 minute
│  (Automation)     │
└───────┬───────────┘
        │
        │ Apply ML algorithms
        ▼
┌───────────────────┐
│  Segmentation DB  │
│  (Enriched Data)  │
└───────┬───────────┘
        │
        │ Query & Filter
        ▼
┌───────────────────┐
│  Campaign System  │
│  (Usage)          │
└───────────────────┘
```

## Scheduler Timeline

```
Time: 00:00 ────────────────────────────────────────►
         │
         ├─► Scheduler Start (on server start)
         │   └─► Immediate sync run
         │
         ├─► +1 min: Scheduled sync #1
         │   └─► Check for new customers
         │
         ├─► +2 min: Scheduled sync #2
         │   └─► Check for new customers
         │
         ├─► +3 min: Scheduled sync #3
         │   └─► Check for new customers
         │
         └─► Continues every 1 minute...
```

## Segment Mapping

```
Frontend Label              MongoDB Field              MongoDB Value
─────────────────────────  ─────────────────────────  ─────────────────────
"New Customers"        →   purchase_frequency     →   "New"
"Loyal Customers"      →   purchase_frequency     →   "Loyal"
"Lapsed Customers"     →   purchase_frequency     →   "Lapsed"
"Seasonal Customers"   →   purchase_frequency     →   "Seasonal"

"High value customers" →   spending               →   "High Value Customer"
"Medium Value"         →   spending               →   "Medium Value"
"Low value customers"  →   spending               →   "Low Value Customer"

"Women"                →   category               →   "Womens"
"Men"                  →   category               →   "Mens"
"Kids"                 →   category               →   "Kids"
"Family"               →   category               →   "Family"
```

## Performance Considerations

```
┌─────────────────────────────────────────────────────┐
│  Optimization Strategy                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. MongoDB Aggregation Pipelines                  │
│     └─► Efficient server-side data processing      │
│                                                     │
│  2. Batch Inserts                                   │
│     └─► Multiple documents inserted at once        │
│                                                     │
│  3. Prevent Concurrent Runs                         │
│     └─► isRunning flag in scheduler                │
│                                                     │
│  4. Indexed Fields (recommended)                    │
│     ├─► customer_id                                 │
│     ├─► segmentation.purchase_frequency             │
│     ├─► segmentation.spending                       │
│     └─► segmentation.category                       │
│                                                     │
│  5. Data Enrichment                                 │
│     └─► Join orders collection only when needed    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

**Architecture Version**: 1.0  
**Last Updated**: October 16, 2025  
**Status**: Production Ready
