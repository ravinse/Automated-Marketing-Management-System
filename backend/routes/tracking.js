const express = require("express");
const Campaign = require("../models/Campaign");
const router = express.Router();

/**
 * @route GET /api/tracking/open/:campaignId/:customerId
 * @desc Track email open (via pixel)
 */
router.get("/open/:campaignId/:customerId", async (req, res) => {
  try {
    const { campaignId, customerId } = req.params;
    
    // Find campaign and increment opened count
    const campaign = await Campaign.findById(campaignId);
    
    if (campaign) {
      campaign.opened = (campaign.opened || 0) + 1;
      
      // Calculate open rate
      if (campaign.sent > 0) {
        const rate = ((campaign.opened / campaign.sent) * 100).toFixed(2);
        campaign.openRate = `${rate}%`;
      }
      
      await campaign.save();
      console.log(`📧 Email opened - Campaign: ${campaign.title}, Customer: ${customerId}`);
    }
    
    // Return a 1x1 transparent pixel image
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(pixel);
  } catch (error) {
    console.error("Error tracking email open:", error);
    // Still return pixel even on error
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length
    });
    res.end(pixel);
  }
});

/**
 * @route GET /api/tracking/click/:campaignId/:customerId
 * @desc Track link click and redirect to target URL
 */
router.get("/click/:campaignId/:customerId", async (req, res) => {
  try {
    const { campaignId, customerId } = req.params;
    const { url } = req.query; // Get the target URL from query parameter
    
    // Find campaign and increment clicked count
    const campaign = await Campaign.findById(campaignId);
    
    if (campaign) {
      campaign.clicked = (campaign.clicked || 0) + 1;
      
      // Calculate click through rate
      if (campaign.sent > 0) {
        const rate = ((campaign.clicked / campaign.sent) * 100).toFixed(2);
        campaign.clickThroughRate = `${rate}%`;
      }
      
      await campaign.save();
      console.log(`🖱️ Link clicked - Campaign: ${campaign.title}, Customer: ${customerId}`);
    }
    
    // Redirect to the target URL or campaign's tracking URL
    const redirectUrl = url || campaign?.trackingUrl || 'https://www.google.com';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error tracking link click:", error);
    // Redirect to a default URL on error
    res.redirect('https://www.google.com');
  }
});

/**
 * @route GET /api/tracking/stats/:campaignId
 * @desc Get tracking statistics for a campaign
 */
router.get("/stats/:campaignId", async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    
    res.json({
      campaignId: campaign._id,
      title: campaign.title,
      sent: campaign.sent || 0,
      opened: campaign.opened || 0,
      clicked: campaign.clicked || 0,
      openRate: campaign.openRate || '0%',
      clickThroughRate: campaign.clickThroughRate || '0%',
      trackingUrl: campaign.trackingUrl
    });
  } catch (error) {
    console.error("Error fetching tracking stats:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
