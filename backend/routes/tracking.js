const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');

/**
 * Track email open
 * GET /api/tracking/open/:campaignId/:customerId
 * Returns a 1x1 transparent GIF pixel
 */
router.get('/open/:campaignId/:customerId', async (req, res) => {
  try {
    const { campaignId, customerId } = req.params;

    // Update campaign opened count
    const campaign = await Campaign.findById(campaignId);
    if (campaign) {
      campaign.opened = (campaign.opened || 0) + 1;
      
      // Calculate open rate
      if (campaign.sent > 0) {
        campaign.openRate = ((campaign.opened / campaign.sent) * 100).toFixed(2) + '%';
      }
      
      await campaign.save();
      
      console.log(`Email opened - Campaign: ${campaign.title}, Customer: ${customerId}, Total Opens: ${campaign.opened}`);
    }

    // Return 1x1 transparent GIF
    const transparentGif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': transparentGif.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    });
    res.end(transparentGif);
  } catch (error) {
    console.error('Error tracking email open:', error);
    
    // Still return transparent GIF even on error
    const transparentGif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': transparentGif.length,
    });
    res.end(transparentGif);
  }
});

/**
 * Track link click and redirect
 * GET /api/tracking/click/:campaignId/:customerId?url=TARGET_URL
 * Increments click count and redirects to the target URL
 */
router.get('/click/:campaignId/:customerId', async (req, res) => {
  try {
    const { campaignId, customerId } = req.params;
    const { url } = req.query;

    // Update campaign clicked count
    const campaign = await Campaign.findById(campaignId);
    if (campaign) {
      campaign.clicked = (campaign.clicked || 0) + 1;
      
      // Calculate click-through rate
      if (campaign.sent > 0) {
        campaign.clickThroughRate = ((campaign.clicked / campaign.sent) * 100).toFixed(2) + '%';
      }
      
      await campaign.save();
      
      console.log(`Link clicked - Campaign: ${campaign.title}, Customer: ${customerId}, Total Clicks: ${campaign.clicked}`);
    }

    // Redirect to target URL or campaign tracking URL
    const redirectUrl = url || campaign?.trackingUrl || 'http://localhost:5174';
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error tracking link click:', error);
    
    // Redirect to home page on error
    res.redirect('http://localhost:5174');
  }
});

/**
 * Get campaign tracking statistics
 * GET /api/tracking/stats/:campaignId
 * Returns detailed tracking statistics for a campaign
 */
router.get('/stats/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Return tracking statistics
    res.json({
      success: true,
      data: {
        campaignId: campaign._id,
        title: campaign.title,
        sent: campaign.sent || 0,
        opened: campaign.opened || 0,
        clicked: campaign.clicked || 0,
        openRate: campaign.openRate || '0.00%',
        clickThroughRate: campaign.clickThroughRate || '0.00%',
        trackingUrl: campaign.trackingUrl || null,
        status: campaign.status
      }
    });
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching campaign statistics',
      error: error.message
    });
  }
});

module.exports = router;
