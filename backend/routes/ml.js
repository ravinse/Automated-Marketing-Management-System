const express = require('express');
const router = express.Router();
const segmentationController = require('../ml/segmentationController');
const { runManualSync } = require('../ml/segmentationScheduler');

// Manual sync endpoint - triggers immediate ML-based segmentation of new customers
router.post('/segmentation/sync', async (req, res) => {
  try {
    await runManualSync();
    res.json({ success: true, message: 'ML segmentation sync completed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'ML segmentation sync failed', error: error.message });
  }
});

// Get all available segments with counts
router.get('/segmentation/available-segments', segmentationController.getAvailableSegments);

// Get filtered customers based on selected segments (POST for complex filter data)
router.post('/segmentation/filtered-customers', segmentationController.getFilteredCustomers);

// Get customers by IDs
router.post('/segmentation/customers-by-ids', segmentationController.getCustomersByIds);

// Preview customer count for selected segments
router.post('/segmentation/preview-count', segmentationController.previewCustomerCount);

// Get segmentation statistics
router.get('/segmentation/stats', segmentationController.getSegmentationStats);

module.exports = router;
