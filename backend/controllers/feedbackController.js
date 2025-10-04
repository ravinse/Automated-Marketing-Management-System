const Feedback = require("../models/Feedback");

// Get all feedbacks with pagination and filtering
exports.getFeedbacks = async (req, res) => {
  try {
    const { page = 1, limit = 4, search = '', campaign = '' } = req.query;
    const query = {};

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add campaign filter
    if (campaign) {
      query.campaign = { $regex: campaign, $options: 'i' };
    }

    const total = await Feedback.countDocuments(query);
    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    res.json({
      items: feedbacks,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: "Error fetching feedbacks", error: error.message });
  }
};

// Get feedback overview (ratings statistics)
exports.getFeedbackOverview = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    const totalReviews = feedbacks.length;

    if (totalReviews === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        distribution: [
          { stars: 5, percentage: 0 },
          { stars: 4, percentage: 0 },
          { stars: 3, percentage: 0 },
          { stars: 2, percentage: 0 },
          { stars: 1, percentage: 0 }
        ]
      });
    }

    // Calculate average rating
    const totalRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
    const averageRating = (totalRating / totalReviews).toFixed(1);

    // Calculate distribution
    const distribution = [5, 4, 3, 2, 1].map(stars => {
      const count = feedbacks.filter(fb => fb.rating === stars).length;
      const percentage = ((count / totalReviews) * 100).toFixed(1);
      return { stars, percentage: parseFloat(percentage) };
    });

    res.json({
      averageRating: parseFloat(averageRating),
      totalReviews,
      distribution
    });
  } catch (error) {
    console.error('Error fetching feedback overview:', error);
    res.status(500).json({ message: "Error fetching overview", error: error.message });
  }
};

// Create new feedback
exports.createFeedback = async (req, res) => {
  try {
    const { name, email, campaign, rating, description, avatar } = req.body;

    // Validation
    if (!name || !campaign || !rating || !description) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const feedback = new Feedback({
      name,
      email,
      campaign,
      rating,
      description,
      avatar
    });

    await feedback.save();
    res.status(201).json({ message: "Feedback created successfully", feedback });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ message: "Error creating feedback", error: error.message });
  }
};

// Get single feedback by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: "Error fetching feedback", error: error.message });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: "Error deleting feedback", error: error.message });
  }
};
