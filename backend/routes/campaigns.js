const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");

// Get all campaigns with filtering and pagination
router.get("/", campaignController.getCampaigns);

// Get campaigns by status
router.get("/status/:status", campaignController.getCampaignsByStatus);

// Create new campaign
router.post("/", campaignController.createCampaign);

// Submit campaign for approval - using action in path
router.patch("/submit/:id", campaignController.submitCampaign);

// Approve campaign - using action in path
router.patch("/approve/:id", campaignController.approveCampaign);

// Reject campaign - using action in path
router.patch("/reject/:id", campaignController.rejectCampaign);

// Start campaign (move to running) - using action in path
router.patch("/start/:id", campaignController.startCampaign);

// Complete campaign manually - using action in path
router.patch("/complete/:id", campaignController.completeCampaign);

// Check and complete expired campaigns (can be called manually or by scheduler)
router.post("/check-expired", campaignController.checkAndCompleteExpiredCampaigns);

// Auto-save campaign (partial update)
router.patch("/autosave/:id", campaignController.autoSaveCampaign);

// Get single campaign by ID
router.get("/:id", campaignController.getCampaignById);

// Update campaign (full update)
router.put("/:id", campaignController.updateCampaign);

// Delete campaign
router.delete("/:id", campaignController.deleteCampaign);

module.exports = router;
