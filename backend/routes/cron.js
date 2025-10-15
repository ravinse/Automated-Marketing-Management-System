const express = require('express');
const router = express.Router();
const { runScheduledChecks } = require('../utils/campaignScheduler');
const { runManualSync } = require('../utils/segmentationScheduler');

/**
 * Cron job endpoints for Railway or external schedulers
 * These endpoints should be called periodically by Railway Cron Jobs
 * 
 * Security: Add authentication or use Railway's internal network
 */

// Verify cron secret for security (optional but recommended)
const verifyCronSecret = (req, res, next) => {
  const cronSecret = process.env.CRON_SECRET;
  
  // Skip verification if no secret is set (for development)
  if (!cronSecret) {
    return next();
  }
  
  const providedSecret = req.headers['x-cron-secret'] || req.query.secret;
  
  if (providedSecret !== cronSecret) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  next();
};

/**
 * @route GET /api/cron/campaigns
 * @desc Run campaign scheduler tasks (start scheduled campaigns, complete expired ones)
 * @access Public (should be called by Railway Cron or authenticated service)
 * 
 * Railway Cron Schedule Suggestion: Every 5 minutes
 * Cron Expression: star-slash-5 space star space star space star space star (every 5 minutes)
 */
router.get('/campaigns', verifyCronSecret, async (req, res) => {
  try {
    console.log('⏰ [Cron] Campaign scheduler triggered');
    await runScheduledChecks();
    res.json({ 
      success: true, 
      message: 'Campaign scheduler tasks completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [Cron] Campaign scheduler error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * @route GET /api/cron/segmentation
 * @desc Run customer segmentation sync
 * @access Public (should be called by Railway Cron or authenticated service)
 * 
 * Railway Cron Schedule Suggestion: Every 5-10 minutes
 * Use cron schedule: every 5 or 10 minutes
 */
router.get('/segmentation', verifyCronSecret, async (req, res) => {
  try {
    console.log('⏰ [Cron] Segmentation sync triggered');
    const result = await runManualSync();
    res.json({ 
      success: true, 
      message: 'Segmentation sync completed',
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [Cron] Segmentation sync error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * @route GET /api/cron/health
 * @desc Health check endpoint for cron jobs
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'cron-endpoints',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route GET /api/cron/all
 * @desc Run all scheduled tasks at once
 * @access Public (should be called by Railway Cron or authenticated service)
 * 
 * Railway Cron Schedule Suggestion: Every 5 minutes
 */
router.get('/all', verifyCronSecret, async (req, res) => {
  try {
    console.log('⏰ [Cron] Running all scheduled tasks');
    
    // Run both tasks
    await Promise.all([
      runScheduledChecks(),
      runManualSync()
    ]);
    
    res.json({ 
      success: true, 
      message: 'All scheduled tasks completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [Cron] Scheduled tasks error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
