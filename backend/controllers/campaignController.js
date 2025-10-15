const Campaign = require("../models/Campaign");
const Customer = require("../models/Customer");
const { sendBatchEmails } = require("../utils/emailService");
const { sendBatchSMS } = require("../utils/smsService");
const { MongoClient } = require('mongodb');

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
      targetedCustomerIds,
      targetedCustomerCount,
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
      targetedCustomerIds,
      targetedCustomerCount,
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
      targetedCustomerIds,
      targetedCustomerCount,
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
    if (targetedCustomerIds !== undefined) campaign.targetedCustomerIds = targetedCustomerIds;
    if (targetedCustomerCount !== undefined) campaign.targetedCustomerCount = targetedCustomerCount;
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

    const now = new Date();
    campaign.approvedAt = now;
    
    // Check if campaign should start immediately
    const shouldStartImmediately = !campaign.startDate || new Date(campaign.startDate) <= now;
    
    if (shouldStartImmediately) {
      // Set to running status and execute immediately
      campaign.status = 'running';
      await campaign.save();
      
      // Execute campaign (send emails/SMS to segmented customers)
      const { executeCampaignAutomatically } = require('../utils/campaignScheduler');
      const executionResult = await executeCampaignAutomatically(campaign);
      
      res.json({ 
        message: "Campaign approved and executed successfully", 
        campaign,
        execution: executionResult
      });
    } else {
      // Schedule for later - set to approved status
      campaign.status = 'approved';
      await campaign.save();
      
      res.json({ 
        message: `Campaign approved and scheduled to start on ${campaign.startDate}`, 
        campaign 
      });
    }
  } catch (error) {
    console.error('Error approving campaign:', error);
    res.status(500).json({ message: "Error approving campaign", error: error.message });
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

// Request resubmission (campaign needs changes)
exports.requestResubmission = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const { reason, rejectionReason, resubmissionNote } = req.body;
    const resubmissionMessage = resubmissionNote || reason || rejectionReason || 'No reason provided';

    campaign.status = 'rejected';
    campaign.rejectedAt = new Date();
    campaign.rejectionReason = resubmissionMessage;
    campaign.resubmissionNote = resubmissionMessage;
    await campaign.save();

    res.json({ 
      message: "Resubmission requested successfully", 
      campaign 
    });
  } catch (error) {
    console.error('Error requesting resubmission:', error);
    res.status(500).json({ message: "Error requesting resubmission", error: error.message });
  }
};

// Reject campaign (can be resubmission or complete rejection based on type parameter)
exports.rejectCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const { reason, rejectionReason, resubmissionNote, type } = req.body;
    
    console.log('Reject campaign received - type:', type, 'resubmissionNote:', resubmissionNote, 'body:', JSON.stringify(req.body));
    
    // If type is 'resubmit' or resubmissionNote is provided, treat as resubmission request
    if (type === 'resubmit' || (resubmissionNote && type !== 'final')) {
      console.log('Taking resubmission path');
      const resubmissionMessage = resubmissionNote || reason || rejectionReason || 'Please make changes and resubmit';
      console.log('Resubmission message:', resubmissionMessage);
      campaign.status = 'rejected';
      campaign.rejectedAt = new Date();
      campaign.rejectionReason = resubmissionMessage;
      campaign.resubmissionNote = resubmissionMessage;
      await campaign.save();

      return res.json({ 
        message: "Resubmission requested successfully", 
        campaign 
      });
    }
    
    // Otherwise, treat as complete rejection
    const rejectionNote = reason || rejectionReason || 'Campaign rejected by manager';
    campaign.status = 'rejected_final';
    campaign.rejectedAt = new Date();
    campaign.rejectionReason = rejectionNote;
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

// Get overall campaign performance (aggregate all campaigns)
exports.getOverallPerformance = async (req, res) => {
  try {
    const allCampaigns = await Campaign.find({});
    const completedCampaigns = await Campaign.find({ status: 'completed' });
    const activeCampaigns = await Campaign.find({ status: 'running' });
    
    // Calculate overall metrics
    const overallMetrics = {
      totalCampaigns: allCampaigns.length,
      activeCampaigns: activeCampaigns.length,
      completedCampaigns: completedCampaigns.length,
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalConversions: 0,
      totalRevenue: 0,
      avgOpenRate: 0,
      avgClickRate: 0,
      avgConversionRate: 0
    };

    // Sum up metrics from all campaigns
    allCampaigns.forEach(campaign => {
      if (campaign.performanceMetrics) {
        overallMetrics.totalSent += campaign.performanceMetrics.sent || 0;
        overallMetrics.totalDelivered += campaign.performanceMetrics.delivered || 0;
        overallMetrics.totalOpened += campaign.performanceMetrics.opened || 0;
        overallMetrics.totalClicked += campaign.performanceMetrics.clicked || 0;
        overallMetrics.totalConversions += campaign.performanceMetrics.conversions || 0;
        overallMetrics.totalRevenue += campaign.performanceMetrics.revenue || 0;
      }
    });

    // Calculate average rates
    if (overallMetrics.totalSent > 0) {
      overallMetrics.avgOpenRate = ((overallMetrics.totalOpened / overallMetrics.totalSent) * 100).toFixed(2);
      overallMetrics.avgClickRate = ((overallMetrics.totalClicked / overallMetrics.totalSent) * 100).toFixed(2);
      overallMetrics.avgConversionRate = ((overallMetrics.totalConversions / overallMetrics.totalSent) * 100).toFixed(2);
    }

    res.json(overallMetrics);
  } catch (error) {
    console.error('Error fetching overall performance:', error);
    res.status(500).json({ message: "Error fetching overall performance", error: error.message });
  }
};

// Get performance for completed campaigns
exports.getCompletedCampaignsPerformance = async (req, res) => {
  try {
    const completedCampaigns = await Campaign.find({ status: 'completed' })
      .sort({ completedAt: -1 })
      .select('title status completedAt performanceMetrics startDate endDate')
      .exec();

    const campaignsWithMetrics = completedCampaigns.map(campaign => {
      const metrics = campaign.performanceMetrics || {};
      const sent = metrics.sent || 0;
      
      return {
        _id: campaign._id,
        title: campaign.title,
        status: campaign.status,
        completedAt: campaign.completedAt,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        sent: sent,
        delivered: metrics.delivered || 0,
        opened: metrics.opened || 0,
        clicked: metrics.clicked || 0,
        conversions: metrics.conversions || 0,
        revenue: metrics.revenue || 0,
        openRate: sent > 0 ? ((metrics.opened || 0) / sent * 100).toFixed(2) : '0.00',
        clickRate: sent > 0 ? ((metrics.clicked || 0) / sent * 100).toFixed(2) : '0.00',
        conversionRate: sent > 0 ? ((metrics.conversions || 0) / sent * 100).toFixed(2) : '0.00'
      };
    });

    res.json(campaignsWithMetrics);
  } catch (error) {
    console.error('Error fetching completed campaigns performance:', error);
    res.status(500).json({ message: "Error fetching completed campaigns performance", error: error.message });
  }
};

// Update campaign performance metrics
exports.updateCampaignMetrics = async (req, res) => {
  try {
    const { id } = req.params;
    const { performanceMetrics } = req.body;

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    campaign.performanceMetrics = {
      ...campaign.performanceMetrics,
      ...performanceMetrics
    };

    await campaign.save();
    res.json({ 
      message: "Campaign metrics updated successfully", 
      campaign 
    });
  } catch (error) {
    console.error('Error updating campaign metrics:', error);
    res.status(500).json({ message: "Error updating campaign metrics", error: error.message });
  }
};

// Execute campaign - send emails and SMS to targeted customers
exports.executeCampaign = async (req, res) => {
  let mongoClient;
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Validate campaign status
    if (campaign.status !== 'running' && campaign.status !== 'approved') {
      return res.status(400).json({ 
        message: "Only running or approved campaigns can be executed",
        currentStatus: campaign.status
      });
    }

    // Validate campaign has required content
    if (!campaign.emailSubject && !campaign.smsContent) {
      return res.status(400).json({ 
        message: "Campaign must have either email subject/content or SMS content to execute" 
      });
    }

    // Get targeted customers from segmentation database
    let customers = [];
    
    // Connect to segmentation database
    const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
    const DATABASE_NAME = process.env.SEGMENTATION_DB || 'retail_db';
    const ORDERS_COLLECTION = process.env.ORDERS_COLLECTION || 'newdatabase';
    
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    const db = mongoClient.db(DATABASE_NAME);
    const ordersCollection = db.collection(ORDERS_COLLECTION);
    
    if (campaign.targetedCustomerIds && campaign.targetedCustomerIds.length > 0) {
      // Get customers by IDs from orders collection
      console.log(`📋 Fetching ${campaign.targetedCustomerIds.length} targeted customers by IDs`);
      
      const customerData = await ordersCollection.aggregate([
        {
          $match: { customer_id: { $in: campaign.targetedCustomerIds } }
        },
        {
          $group: {
            _id: "$customer_id",
            customer_name: { $first: "$customer_name" },
            email: { $first: "$email" },
            phone_number: { $first: "$phone_number" },
            gender: { $first: "$gender" }
          }
        }
      ]).toArray();
      
      customers = customerData.map(c => ({
        _id: c._id,
        name: c.customer_name,
        email: c.email,
        phone: c.phone_number
      }));
    } else {
      return res.status(400).json({ 
        message: "Campaign has no targeted customers. Please ensure customer IDs are saved in the campaign." 
      });
    }

    if (customers.length === 0) {
      return res.status(400).json({ 
        message: "No customers found for this campaign. The targeted customer IDs may be invalid." 
      });
    }

    console.log(`📧 Executing campaign: ${campaign.title}`);
    console.log(`📧 Email Subject: ${campaign.emailSubject}`);
    console.log(`📧 Targeting ${customers.length} customers`);

    // Initialize execution results
    const executionResults = {
      totalCustomers: customers.length,
      emailResults: null,
      smsResults: null,
      startedAt: new Date(),
    };

    // Send emails if email content is provided
    if (campaign.emailSubject && campaign.emailContent) {
      console.log(`📧 Sending emails with subject: "${campaign.emailSubject}"`);
      
      const emailRecipients = customers
        .filter(customer => customer.email) // Only customers with email
        .map(customer => ({
          email: customer.email,
          subject: campaign.emailSubject, // Use campaign's email subject
          content: campaign.emailContent, // Use campaign's email content
        }));

      if (emailRecipients.length > 0) {
        executionResults.emailResults = await sendBatchEmails(
          emailRecipients,
          campaign.emailSubject, // Pass campaign's email subject as default
          campaign.emailContent  // Pass campaign's email content as default
        );
        
        console.log(`✉️ Emails sent: ${executionResults.emailResults.sent}/${executionResults.emailResults.total}`);
      } else {
        console.log('⚠️ No customers with email addresses found');
        executionResults.emailResults = {
          total: 0,
          sent: 0,
          failed: 0,
          details: [],
        };
      }
    }

    // Send SMS if SMS content is provided
    if (campaign.smsContent) {
      console.log(`📱 Sending SMS with message: "${campaign.smsContent.substring(0, 50)}..."`);
      
      const smsRecipients = customers
        .filter(customer => customer.phone) // Only customers with phone numbers
        .map(customer => ({
          phone: customer.phone,
          message: campaign.smsContent, // Use campaign's SMS content
        }));

      if (smsRecipients.length > 0) {
        executionResults.smsResults = await sendBatchSMS(
          smsRecipients,
          campaign.smsContent
        );
        
        console.log(`📱 SMS sent: ${executionResults.smsResults.sent}/${executionResults.smsResults.total}`);
      } else {
        console.log('⚠️ No customers with phone numbers found');
        executionResults.smsResults = {
          total: 0,
          sent: 0,
          failed: 0,
          details: [],
        };
      }
    }

    executionResults.completedAt = new Date();

    // Update campaign performance metrics
    const emailsSent = executionResults.emailResults ? executionResults.emailResults.sent : 0;
    const smsSent = executionResults.smsResults ? executionResults.smsResults.sent : 0;
    const totalSent = emailsSent + smsSent;

    campaign.performanceMetrics = {
      ...campaign.performanceMetrics,
      sent: (campaign.performanceMetrics.sent || 0) + totalSent,
      delivered: (campaign.performanceMetrics.delivered || 0) + totalSent, // Assuming delivered for now
    };

    // Update campaign status to running if it was approved
    if (campaign.status === 'approved') {
      campaign.status = 'running';
    }

    await campaign.save();

    console.log(`✅ Campaign "${campaign.title}" executed successfully!`);

    res.json({ 
      message: "Campaign executed successfully",
      campaign,
      executionResults: {
        totalCustomers: executionResults.totalCustomers,
        emails: executionResults.emailResults ? {
          sent: executionResults.emailResults.sent,
          failed: executionResults.emailResults.failed,
          total: executionResults.emailResults.total,
        } : null,
        sms: executionResults.smsResults ? {
          sent: executionResults.smsResults.sent,
          failed: executionResults.smsResults.failed,
          total: executionResults.smsResults.total,
        } : null,
        startedAt: executionResults.startedAt,
        completedAt: executionResults.completedAt,
      }
    });
  } catch (error) {
    console.error('Error executing campaign:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: "Error executing campaign", error: error.message });
  } finally {
    if (mongoClient) {
      await mongoClient.close();
    }
  }
};
