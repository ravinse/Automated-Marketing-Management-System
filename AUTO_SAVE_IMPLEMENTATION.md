# Auto-Save Campaign Feature - Implementation Summary

## Overview
Implemented auto-save functionality for the Campaign Creation form that automatically saves draft data to MongoDB when users move between form sections.

## Backend Implementation

### 1. Campaign Model (`backend/models/Campaign.js`)
Created a comprehensive schema with:
- **Basic Info**: title, description, createdBy
- **Targeting**: startDate, endDate, selectedFilters, customerSegments
- **Content**: emailSubject, emailContent, smsContent, attachments
- **Status Management**: 
  - Status enum: `draft`, `pending_approval`, `approved`, `running`, `completed`, `rejected`
  - currentStep tracking: `basic`, `targeting`, `content`, `template`
- **Timestamps**: Automatic createdAt and updatedAt fields

### 2. Campaign Controller (`backend/controllers/campaignController.js`)
Implemented 8 controller methods:
- `getCampaigns()` - Fetch all campaigns with filtering
- `getCampaignById()` - Get single campaign details
- `createCampaign()` - Create new campaign
- **`autoSaveCampaign()`** - **KEY METHOD** for auto-save functionality
  - Creates new campaign if ID is 'new'
  - Updates only provided fields (partial update)
  - Returns campaign ID for tracking
- `updateCampaign()` - Full campaign update
- `submitCampaign()` - Submit for approval
- `approveCampaign()` - Approve campaign
- `deleteCampaign()` - Delete campaign

### 3. Campaign Routes (`backend/routes/campaigns.js`)
RESTful API endpoints:
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns` - Create new campaign
- **`PATCH /api/campaigns/:id/autosave`** - **Auto-save endpoint**
- `PUT /api/campaigns/:id` - Full update
- `PATCH /api/campaigns/:id/submit` - Submit for approval
- `PATCH /api/campaigns/:id/approve` - Approve campaign
- `DELETE /api/campaigns/:id` - Delete campaign

## Frontend Implementation

### Campaign Creation Component (`frontend/src/pages/CampaignCreation.jsx`)

#### State Management
Added four new state variables:
```javascript
const [campaignId, setCampaignId] = useState(null);      // Track saved campaign ID
const [currentStep, setCurrentStep] = useState('basic');  // Track form section
const [autoSaving, setAutoSaving] = useState(false);      // Show saving indicator
```

#### Auto-Save Logic

**1. Debounced Auto-Save on Field Changes:**
```javascript
const triggerAutoSave = () => {
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    autoSaveCampaign(formData);
  }, 2000); // Saves 2 seconds after user stops typing
};
```

**2. Auto-Save Function:**
- Calls `POST /api/campaigns` for new campaigns
- Calls `PATCH /api/campaigns/:id/autosave` for existing drafts
- Stores campaign ID after first save
- Shows loading indicator during save
- Logs success/error to console

**3. Section Transition Saves:**
When user focuses on:
- **Targeting section** (Start Date field) → Saves if coming from Basic section
- **Content section** (Email Subject field) → Saves if coming from Targeting section

#### Visual Indicators
- **Top-right corner**: Spinning icon with "Saving..." text
- **Section headers**: "(Saving...)" text during save operations
- **Below title**: "✓ Draft saved (ID: xxx)" when campaign is saved

## How It Works

### User Journey:
1. User opens `/campaigncreation` or `/newcampaign`
2. Fills in Campaign Title and Description
3. Every field change triggers auto-save after 2-second delay
4. When user clicks on "Start Date" (targeting section):
   - System detects section transition
   - Immediately saves all data from Basic section
   - Creates new campaign in MongoDB with status "draft"
   - Returns campaign ID and stores it in state
5. User continues filling targeting fields
6. Each change auto-saves with 2-second debounce
7. When user clicks on "Email Subject" (content section):
   - System saves all targeting data
   - Updates campaign in database
8. Process continues for remaining sections

### Data Flow:
```
User Input → handleChange() → triggerAutoSave() 
  → 2s delay → autoSaveCampaign() 
  → API Call (POST/PATCH) → MongoDB 
  → Response with Campaign ID → Update UI
```

## API Endpoints in Use

### POST /api/campaigns
**Purpose**: Create new campaign draft
**Request Body**: Full campaign object
**Response**: 
```json
{
  "message": "Campaign created successfully",
  "campaign": {
    "_id": "...",
    "title": "...",
    "status": "draft",
    ...
  }
}
```

### PATCH /api/campaigns/:id/autosave
**Purpose**: Update existing draft with partial data
**Request Body**: Only changed fields
**Response**:
```json
{
  "message": "Campaign auto-saved successfully",
  "campaign": {
    "_id": "...",
    ...updated fields...
  }
}
```

## Testing the Feature

### 1. Start the servers:
```powershell
# Terminal 1 - Backend
cd backend
npm start
# Should show: 🚀 Server running on port 5001

# Terminal 2 - Frontend  
cd frontend
npm run dev
# Should show: http://localhost:5180
```

### 2. Test Auto-Save:
1. Navigate to http://localhost:5180/newcampaign
2. Type a campaign title (e.g., "Summer Sale Campaign")
3. Wait 2 seconds → Check console for "Campaign auto-saved successfully"
4. Check MongoDB → Should see new document with status "draft"
5. Note the campaign ID displayed under the page title
6. Click on "Start Date" field → Immediate save triggered
7. Fill targeting info → Auto-saves every 2 seconds
8. Click on "Email Subject" → Immediate save triggered

### 3. Verify in MongoDB:
```javascript
// In MongoDB Atlas or Compass
db.campaigns.find({ status: "draft" }).pretty()
```

## Benefits

✅ **No Data Loss**: All progress is automatically saved
✅ **User-Friendly**: No manual "Save Draft" button needed
✅ **Efficient**: Debouncing prevents excessive API calls
✅ **Visual Feedback**: Loading indicators show save status
✅ **Resume Work**: Users can return later using campaign ID

## Configuration

### Environment Variables
Backend `.env` file:
```
MONGODB_URI=mongodb+srv://yashodakalhara187_db_user:EeNxZVRFzvZC6sld@feedbackcluster.v9m9pp1.mongodb.net/FeedbackDB
PORT=5001
```

Frontend (uses Vite env vars):
```
VITE_API_BASE_URL=http://localhost:5001/api
```

## Technical Notes

- **Debounce Delay**: Set to 2000ms (2 seconds) to balance UX and server load
- **Campaign ID**: Stored in state, persists until page reload
- **Status**: All auto-saves use status "draft"
- **Current Step**: Tracks which section user is working on
- **Error Handling**: Errors logged to console (can be enhanced with toast notifications)

## Future Enhancements

1. **Local Storage**: Persist campaign ID in localStorage for page refreshes
2. **Toast Notifications**: Show success/error messages to user
3. **Offline Mode**: Save to localStorage when offline, sync when online
4. **Auto-Resume**: Load last edited draft on component mount
5. **Conflict Resolution**: Handle multiple users editing same campaign
6. **Version History**: Track changes over time

## Files Modified/Created

### Backend:
- ✅ `backend/models/Campaign.js` (new)
- ✅ `backend/controllers/campaignController.js` (new)
- ✅ `backend/routes/campaigns.js` (new)
- ✅ `backend/index.js` (updated - added campaign routes)

### Frontend:
- ✅ `frontend/src/pages/CampaignCreation.jsx` (updated - added auto-save)

---

**Implementation Complete** ✅  
Auto-save is now fully functional for campaign creation!
