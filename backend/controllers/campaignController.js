const Campaign = require("../models/Campaign");
const Customer = require("../models/Customer");
const sendEmail = require("../utils/sendEmail");

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

// Approve campaign (automatically sets to running status)
exports.approveCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Set to running status directly when approved
    campaign.status = 'running';
    campaign.approvedAt = new Date();
    await campaign.save();

    // Send campaign emails automatically when approved
    try {
      await sendCampaignEmails(campaign);
    } catch (emailError) {
      console.error('Error sending campaign emails:', emailError);
      // Continue even if email sending fails
    }

    res.json({ 
      message: "Campaign approved and started successfully", 
      campaign 
    });
  } catch (error) {
    console.error('Error approving campaign:', error);
    res.status(500).json({ message: "Error approving campaign", error: error.message });
  }
};

// Helper function to send campaign emails
const sendCampaignEmails = async (campaign) => {
  try {
    console.log(`📧 Starting to send emails for campaign: ${campaign.title}`);
    
    // Find customers based on campaign segments
    let customers = [];
    
    if (campaign.customerSegments && campaign.customerSegments.length > 0) {
      // Get customers matching the segments
      customers = await Customer.find({
        segment: { $in: campaign.customerSegments }
      });
    } else {
      // If no segments specified, get all customers
      customers = await Customer.find();
    }
    
    console.log(`📧 Found ${customers.length} customers to send emails to`);
    
    // Send email to each customer
    let sentCount = 0;
    for (const customer of customers) {
      try {
        await sendEmail(
          customer.email,
          campaign.emailSubject || campaign.title,
          campaign.emailContent || campaign.description,
          campaign._id.toString(),
          customer._id.toString()
        );
        sentCount++;
      } catch (error) {
        console.error(`Failed to send email to ${customer.email}:`, error);
      }
    }
    
    // Update campaign with sent count
    campaign.sent = sentCount;
    await campaign.save();
    
    console.log(`✅ Successfully sent ${sentCount} emails for campaign: ${campaign.title}`);
    return sentCount;
  } catch (error) {
    console.error('Error in sendCampaignEmails:', error);
    throw error;
  }
};

// Start campaign (move from approved to running)
exports.startCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Validate campaign can be started
    if (campaign.status !== 'approved') {
      return res.status(400).json({ 
        message: "Only approved campaigns can be started",
        currentStatus: campaign.status
      });
    }

    // Validate required fields for running a campaign
    if (!campaign.startDate || !campaign.endDate) {
      return res.status(400).json({ 
        message: "Start date and end date are required to run a campaign" 
      });
    }

    campaign.status = 'running';
    await campaign.save();

    res.json({ 
      message: "Campaign started successfully", 
      campaign 
    });
  } catch (error) {
    console.error('Error starting campaign:', error);
    res.status(500).json({ message: "Error starting campaign", error: error.message });
  }
};

// Complete campaign manually
exports.completeCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Validate campaign can be completed
    if (campaign.status !== 'running' && campaign.status !== 'approved') {
      return res.status(400).json({ 
        message: "Only running or approved campaigns can be completed",
        currentStatus: campaign.status
      });
    }

    campaign.status = 'completed';
    campaign.completedAt = new Date();
    await campaign.save();

    res.json({ 
      message: "Campaign completed successfully", 
      campaign 
    });
  } catch (error) {
    console.error('Error completing campaign:', error);
    res.status(500).json({ message: "Error completing campaign", error: error.message });
  }
};

// Check and complete expired campaigns (can be called by scheduler or manually)
exports.checkAndCompleteExpiredCampaigns = async (req, res) => {
  try {
    const now = new Date();
    
    // Find all running campaigns where end date has passed
    const expiredCampaigns = await Campaign.find({
      status: 'running',
      endDate: { $lte: now }
    });

    // Update all expired campaigns to completed
    const completedCount = expiredCampaigns.length;
    for (const campaign of expiredCampaigns) {
      campaign.status = 'completed';
      campaign.completedAt = now;
      await campaign.save();
    }

    console.log(`Completed ${completedCount} expired campaigns`);
    
    if (res) {
      res.json({ 
        message: `Successfully completed ${completedCount} expired campaigns`,
        completedCampaigns: expiredCampaigns.map(c => ({
          id: c._id,
          title: c.title,
          endDate: c.endDate
        }))
      });
    }
    
    return completedCount;
  } catch (error) {
    console.error('Error checking expired campaigns:', error);
    if (res) {
      res.status(500).json({ message: "Error checking expired campaigns", error: error.message });
    }
  }
};

// Reject campaign
exports.rejectCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const { reason } = req.body;

    campaign.status = 'rejected';
    campaign.rejectedAt = new Date();
    campaign.rejectionReason = reason || 'No reason provided';
    await campaign.save();

    res.json({ 
      message: "Campaign rejected successfully", 
      campaign 
    });
  } catch (error) {
    console.error('Error rejecting campaign:', error);
    res.status(500).json({ message: "Error rejecting campaign", error: error.message });
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

// Send campaign emails manually
exports.sendCampaignEmailsManually = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.status !== 'running' && campaign.status !== 'approved') {
      return res.status(400).json({ 
        message: "Only running or approved campaigns can send emails" 
      });
    }

    const sentCount = await sendCampaignEmails(campaign);

    res.json({ 
      message: "Campaign emails sent successfully", 
      sentCount,
      campaign 
    });
  } catch (error) {
    console.error('Error sending campaign emails:', error);
    res.status(500).json({ message: "Error sending campaign emails", error: error.message });
  }
};

// Update campaign tracking URL
exports.updateTrackingUrl = async (req, res) => {
  try {
    const { trackingUrl } = req.body;
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { trackingUrl },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.json({ 
      message: "Tracking URL updated successfully", 
      campaign 
    });
  } catch (error) {
    console.error('Error updating tracking URL:', error);
    res.status(500).json({ message: "Error updating tracking URL", error: error.message });
  }
};
