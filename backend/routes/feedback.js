const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const { validateObjectId } = require("../middleware/authMiddleware");

// Get all feedbacks with pagination and filtering
router.get("/", feedbackController.getFeedbacks);

// Get feedback overview/statistics
router.get("/overview", feedbackController.getFeedbackOverview);

// Get single feedback by ID
router.get("/:id", validateObjectId(), feedbackController.getFeedbackById);

// Create new feedback
router.post("/", feedbackController.createFeedback);

// Delete feedback
router.delete("/:id", validateObjectId(), feedbackController.deleteFeedback);

module.exports = router;
