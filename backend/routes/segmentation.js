const express = require('express');
const router = express.Router();
const segmentationController = require('../controllers/segmentationController');

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
