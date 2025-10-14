const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const { validateObjectId } = require("../middleware/authMiddleware");

// Get all campaigns with filtering and pagination
router.get("/", campaignController.getCampaigns);

// Get campaigns by status
router.get("/status/:status", campaignController.getCampaignsByStatus);

// Create new campaign
router.post("/", campaignController.createCampaign);

// Submit campaign for approval - using action in path
router.patch("/submit/:id", validateObjectId(), campaignController.submitCampaign);

// Approve campaign - using action in path
router.patch("/approve/:id", validateObjectId(), campaignController.approveCampaign);

// Reject campaign - using action in path
router.patch("/reject/:id", validateObjectId(), campaignController.rejectCampaign);

// Start campaign (move to running) - using action in path
router.patch("/start/:id", validateObjectId(), campaignController.startCampaign);

// Complete campaign manually - using action in path
router.patch("/complete/:id", validateObjectId(), campaignController.completeCampaign);

// Check and complete expired campaigns (can be called manually or by scheduler)
router.post("/check-expired", campaignController.checkAndCompleteExpiredCampaigns);

// Auto-save campaign (partial update)
router.patch("/autosave/:id", validateObjectId(), campaignController.autoSaveCampaign);

// Get single campaign by ID
router.get("/:id", validateObjectId(), campaignController.getCampaignById);

// Update campaign (full update)
router.put("/:id", validateObjectId(), campaignController.updateCampaign);

// Delete campaign
router.delete("/:id", validateObjectId(), campaignController.deleteCampaign);

module.exports = router;
