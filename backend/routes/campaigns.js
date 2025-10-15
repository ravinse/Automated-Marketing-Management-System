const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const { validateObjectId } = require("../middleware/authMiddleware");

// Get all campaigns with filtering and pagination
router.get("/", campaignController.getCampaigns);

// Get campaigns by status
router.get("/status/:status", campaignController.getCampaignsByStatus);

// Get overall performance metrics
router.get("/performance/overall", campaignController.getOverallPerformance);

// Get completed campaigns with performance metrics
router.get("/performance/completed", campaignController.getCompletedCampaignsPerformance);

// Create new campaign
router.post("/", campaignController.createCampaign);

// Submit campaign for approval - using action in path
router.patch("/submit/:id", validateObjectId(), campaignController.submitCampaign);

// Approve campaign - using action in path
router.patch("/approve/:id", validateObjectId(), campaignController.approveCampaign);

// Reject campaign - using action in path
router.patch("/reject/:id", campaignController.rejectCampaign);

// Start campaign (move to running) - using action in path
router.patch("/start/:id", validateObjectId(), campaignController.startCampaign);

// Complete campaign manually - using action in path
router.patch("/complete/:id", validateObjectId(), campaignController.completeCampaign);

// Execute campaign - send emails and SMS to targeted customers
router.post("/execute/:id", validateObjectId(), campaignController.executeCampaign);

// Check and complete expired campaigns (can be called manually or by scheduler)
router.post("/check-expired", campaignController.checkAndCompleteExpiredCampaigns);

// Auto-save campaign (partial update)
router.patch("/autosave/:id", validateObjectId(), campaignController.autoSaveCampaign);

// Get single campaign by ID
router.get("/:id", validateObjectId(), campaignController.getCampaignById);

// Update campaign (full update)
router.put("/:id", validateObjectId(), campaignController.updateCampaign);

// Update campaign performance metrics
router.patch("/:id/metrics", validateObjectId(), campaignController.updateCampaignMetrics);

// Send campaign emails manually with tracking
router.post("/send-emails/:id", validateObjectId(), campaignController.sendCampaignEmailsManually);

// Update campaign tracking URL
router.patch("/tracking-url/:id", validateObjectId(), campaignController.updateTrackingUrl);

// Delete campaign
router.delete("/:id", validateObjectId(), campaignController.deleteCampaign);

module.exports = router;
