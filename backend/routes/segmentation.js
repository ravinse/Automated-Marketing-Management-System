const express = require('express');
const router = express.Router();
const segmentationController = require('../controllers/segmentationController');
const { runManualSync } = require('../utils/segmentationScheduler');

// Manual sync endpoint - triggers immediate segmentation of new customers
router.post('/sync', async (req, res) => {
  try {
    await runManualSync();
    res.json({ success: true, message: 'Segmentation sync completed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sync failed', error: error.message });
  }
});

// Get all available segments with counts
router.get('/available-segments', segmentationController.getAvailableSegments);

// Get filtered customers based on selected segments (POST for complex filter data)
router.post('/filtered-customers', segmentationController.getFilteredCustomers);

// Get customers by IDs
router.post('/customers-by-ids', segmentationController.getCustomersByIds);

// Preview customer count for selected segments
router.post('/preview-count', segmentationController.previewCustomerCount);

// Get segmentation statistics
router.get('/stats', segmentationController.getSegmentationStats);

module.exports = router;
