const Campaign = require("../models/Campaign");

// Get all campaigns
exports.getCampaigns = async (req, res) => {
  try {
    const { status, createdBy, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (createdBy) query.createdBy = createdBy;

    const total = await Campaign.countDocuments(query);
    const campaigns = await Campaign.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    res.json({
      items: campaigns,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: "Error fetching campaigns", error: error.message });
  }
};

// Get single campaign by ID
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: "Error fetching campaign", error: error.message });
  }
};

// Create new campaign or save draft
exports.createCampaign = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      selectedFilters,
      customerSegments,
      emailSubject,
      emailContent,
      smsContent,
      templateName,
      attachments,
      status,
      createdBy,
      currentStep
    } = req.body;

    // Validation for minimum required fields
    if (!title || !createdBy) {
      return res.status(400).json({ 
        message: "Title and createdBy are required" 
      });
    }

    const campaign = new Campaign({
      title,
      description,
      startDate,
      endDate,
      selectedFilters,
      customerSegments,
      emailSubject,
      emailContent,
      smsContent,
      templateName,
      attachments,
      status: status || 'draft',
      createdBy,
      currentStep: currentStep || 'basic'
    });

    await campaign.save();
    res.status(201).json({ 
      message: "Campaign created successfully", 
      campaign 
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: "Error creating campaign", error: error.message });
  }
};

// Update campaign (auto-save/draft)
exports.updateCampaign = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      selectedFilters,
      customerSegments,
      emailSubject,
      emailContent,
      smsContent,
      templateName,
      attachments,
      status,
      currentStep
    } = req.body;

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Update fields
    if (title !== undefined) campaign.title = title;
    if (description !== undefined) campaign.description = description;
    if (startDate !== undefined) campaign.startDate = startDate;
    if (endDate !== undefined) campaign.endDate = endDate;
    if (selectedFilters !== undefined) campaign.selectedFilters = selectedFilters;
    if (customerSegments !== undefined) campaign.customerSegments = customerSegments;
    if (emailSubject !== undefined) campaign.emailSubject = emailSubject;
    if (emailContent !== undefined) campaign.emailContent = emailContent;
    if (smsContent !== undefined) campaign.smsContent = smsContent;
    if (templateName !== undefined) campaign.templateName = templateName;
    if (attachments !== undefined) campaign.attachments = attachments;
    if (status !== undefined) campaign.status = status;
    if (currentStep !== undefined) campaign.currentStep = currentStep;

    // Update timestamps based on status
    if (status === 'pending_approval' && !campaign.submittedAt) {
      campaign.submittedAt = new Date();
    }
    if (status === 'approved' && !campaign.approvedAt) {
      campaign.approvedAt = new Date();
    }
    if (status === 'completed' && !campaign.completedAt) {
      campaign.completedAt = new Date();
    }

    await campaign.save();
    res.json({ 
      message: "Campaign updated successfully", 
      campaign 
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: "Error updating campaign", error: error.message });
  }
};

// Auto-save campaign data (partial update)
exports.autoSaveCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const updateData = req.body;

    // If no campaign ID, create new one
    if (!campaignId || campaignId === 'new') {
      return exports.createCampaign(req, res);
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Update only provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        campaign[key] = updateData[key];
      }
    });

    await campaign.save();
    res.json({ 
      message: "Campaign auto-saved successfully", 
      campaign 
    });
  } catch (error) {
    console.error('Error auto-saving campaign:', error);
    res.status(500).json({ message: "Error auto-saving campaign", error: error.message });
  }
};

// Submit campaign for approval
exports.submitCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Validate required fields for submission
    if (!campaign.title || !campaign.description) {
      return res.status(400).json({ 
        message: "Title and description are required for submission" 
      });
    }

    campaign.status = 'pending_approval';
    campaign.submittedAt = new Date();
    await campaign.save();

    res.json({ 
      message: "Campaign submitted for approval successfully", 
      campaign 
    });
  } catch (error) {
    console.error('Error submitting campaign:', error);
    res.status(500).json({ message: "Error submitting campaign", error: error.message });
  }
};

// Approve campaign
exports.approveCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    campaign.status = 'approved';
    campaign.approvedAt = new Date();
    await campaign.save();

    res.json({ 
      message: "Campaign approved successfully", 
      campaign 
    });
  } catch (error) {
    console.error('Error approving campaign:', error);
    res.status(500).json({ message: "Error approving campaign", error: error.message });
  }
};

// Delete campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: "Error deleting campaign", error: error.message });
  }
};

// Get campaigns by status
exports.getCampaignsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const campaigns = await Campaign.find({ status })
      .sort({ updatedAt: -1 })
      .exec();

    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns by status:', error);
    res.status(500).json({ message: "Error fetching campaigns", error: error.message });
  }
};
