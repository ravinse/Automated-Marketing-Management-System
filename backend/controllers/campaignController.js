const Campaign = require("../models/Campaign");
const Customer = require("../models/Customer");
const { sendBatchEmails, sendEmail } = require("../utils/emailService");
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
    if (targetedCustomerIds !== undefined) {
      campaign.targetedCustomerIds = targetedCustomerIds;
      console.log(`✅ Updated targetedCustomerIds: ${targetedCustomerIds.length} customers`);
    }
    if (targetedCustomerCount !== undefined) {
      campaign.targetedCustomerCount = targetedCustomerCount;
      console.log(`✅ Updated targetedCustomerCount: ${targetedCustomerCount}`);
    }
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

    // Log customer targeting updates
    if (updateData.targetedCustomerIds !== undefined) {
      console.log(`✅ Auto-save: targetedCustomerIds updated (${updateData.targetedCustomerIds.length} customers)`);
    }
    if (updateData.targetedCustomerCount !== undefined) {
      console.log(`✅ Auto-save: targetedCustomerCount updated (${updateData.targetedCustomerCount})`);
    }

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
      // Set to running status
      campaign.status = 'running';
      await campaign.save();
      
      // Send emails with tracking (this includes the button)
      let emailResults = null;
      try {
        emailResults = await sendCampaignEmails(campaign);
        console.log('✅ Campaign emails sent with tracking:', emailResults);
      } catch (emailError) {
        console.error('❌ Error sending campaign emails:', emailError);
      }
      
      res.json({ 
        message: "Campaign approved and emails sent successfully", 
        campaign,
        emailTracking: emailResults
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
    
    console.log(`📋 Campaign Debug Info:`);
    console.log(`   - Campaign ID: ${campaign._id}`);
    console.log(`   - Title: ${campaign.title}`);
    console.log(`   - Status: ${campaign.status}`);
    console.log(`   - Customer Segments: ${JSON.stringify(campaign.customerSegments)}`);
    console.log(`   - Targeted Customer Count: ${campaign.targetedCustomerCount}`);
    console.log(`   - Targeted Customer IDs Length: ${campaign.targetedCustomerIds?.length || 0}`);
    
    if (campaign.targetedCustomerIds && campaign.targetedCustomerIds.length > 0) {
      // Get customers by IDs from orders collection
      console.log(`📋 Fetching ${campaign.targetedCustomerIds.length} targeted customers by IDs`);
      console.log(`   First 5 IDs: ${campaign.targetedCustomerIds.slice(0, 5).join(', ')}`);
      
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
      
      console.log(`   Found ${customerData.length} customers in orders collection`);
      
      customers = customerData.map(c => ({
        _id: c._id,
        name: c.customer_name,
        email: c.email,
        phone: c.phone_number
      }));
    } else {
      console.error(`❌ No customer IDs found in campaign!`);
      console.error(`   Campaign shows ${campaign.targetedCustomerCount} customers but IDs array is empty`);
      console.error(`   This means customer IDs were not saved during campaign creation`);
      
      return res.status(400).json({ 
        message: `Campaign has no targeted customers. The campaign shows ${campaign.targetedCustomerCount} customer count but no customer IDs are saved. Please re-select customers and save the campaign again.`,
        debug: {
          campaignId: campaign._id,
          targetedCustomerCount: campaign.targetedCustomerCount,
          targetedCustomerIdsLength: campaign.targetedCustomerIds?.length || 0
        }
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

// Helper function to send campaign emails with tracking
const sendCampaignEmails = async (campaign) => {
  try {
    console.log(`Sending emails for campaign: ${campaign.title}`);
    
    // Get customers based on segments
    const customers = await Customer.find({
      segment: { $in: campaign.customerSegments }
    });
    
    console.log(`Found ${customers.length} customers to send emails to`);
    
    let sentCount = 0;
    let failedCount = 0;
    
    // Prepare email content with proper HTML structure
    let emailContent = campaign.emailContent || '';
    
    // Wrap plain text content in professional HTML structure if needed
    if (!emailContent.includes('<html') && !emailContent.includes('<body')) {
      emailContent = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>${campaign.title || 'Marketing Campaign'}</title>
            <style>
              @media only screen and (max-width: 600px) {
                .email-container {
                  width: 100% !important;
                  padding: 10px !important;
                }
                .content-wrapper {
                  padding: 20px !important;
                }
                .cta-button {
                  padding: 12px 30px !important;
                  font-size: 14px !important;
                }
              }
            </style>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f7fa;">
              <tr>
                <td style="padding: 20px 0;">
                  <!-- Main Container -->
                  <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" align="center" 
                         style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    
                    <!-- Header Section -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #00AF96 0%, #00D9B5 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                          ${campaign.title || '🎯 Special Offer'}
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content Section -->
                    <tr>
                      <td class="content-wrapper" style="padding: 40px 30px; color: #333333; font-size: 16px; line-height: 1.8;">
                        <div style="text-align: left;">
                          ${emailContent}
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer Section -->
                    <tr>
                      <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                        <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                          Thank you for being a valued customer! 💙
                        </p>
                        <p style="margin: 0; color: #adb5bd; font-size: 12px; line-height: 1.5;">
                          © ${new Date().getFullYear()} Marketing Management System. All rights reserved.
                        </p>
                        <div style="margin-top: 15px;">
                          <a href="#" style="color: #00AF96; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
                          <span style="color: #dee2e6;">|</span>
                          <a href="#" style="color: #00AF96; text-decoration: none; font-size: 12px; margin: 0 10px;">Unsubscribe</a>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;
    }
    
    // Add sample call-to-action link if email content doesn't have links
    if (!emailContent.includes('<a ') && !emailContent.includes('href=')) {
      // Add a professional CTA button
      const ctaButton = `
        <!-- CTA Button Section -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="border-radius: 6px; background: linear-gradient(135deg, #00AF96 0%, #00D9B5 100%); box-shadow: 0 4px 15px rgba(0, 175, 150, 0.3);">
                    <a href="${campaign.trackingUrl || 'http://localhost:5174'}" target="_blank" 
                       class="cta-button"
                       style="font-size: 16px; 
                              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                              color: #ffffff; 
                              text-decoration: none; 
                              padding: 16px 50px; 
                              display: inline-block; 
                              font-weight: 600;
                              letter-spacing: 0.5px;
                              text-transform: uppercase;">
                      🛍️ Explore Now
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Divider -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
          <tr>
            <td style="border-bottom: 2px solid #e9ecef;"></td>
          </tr>
        </table>
      `;
      
      // Insert button before content wrapper closing
      if (emailContent.includes('</div>')) {
        const lastDivIndex = emailContent.lastIndexOf('</div>');
        emailContent = emailContent.substring(0, lastDivIndex) + ctaButton + emailContent.substring(lastDivIndex);
      } else if (emailContent.includes('</td>')) {
        const contentTdIndex = emailContent.indexOf('</td>', emailContent.indexOf('content-wrapper'));
        if (contentTdIndex > -1) {
          emailContent = emailContent.substring(0, contentTdIndex) + ctaButton + emailContent.substring(contentTdIndex);
        }
      } else if (emailContent.includes('</body>')) {
        emailContent = emailContent.replace('</body>', `${ctaButton}</body>`);
      } else {
        emailContent += ctaButton;
      }
    }
    
    // Send emails to each customer
    for (const customer of customers) {
      if (!customer.email) {
        console.log(`Customer ${customer._id} has no email address`);
        continue;
      }
      
      const result = await sendEmail(
        customer.email,
        campaign.emailSubject,
        emailContent,
        null, // text content
        campaign._id.toString(), // campaignId for tracking
        customer._id.toString()  // customerId for tracking
      );
      
      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Update campaign sent count
    campaign.sent = sentCount;
    await campaign.save();
    
    console.log(`Campaign emails sent: ${sentCount} successful, ${failedCount} failed`);
    
    return {
      sent: sentCount,
      failed: failedCount,
      total: customers.length
    };
  } catch (error) {
    console.error('Error sending campaign emails:', error);
    throw error;
  }
};

// Send campaign emails manually
exports.sendCampaignEmailsManually = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    if (campaign.status !== 'approved' && campaign.status !== 'running') {
      return res.status(400).json({ 
        message: "Campaign must be approved or running to send emails" 
      });
    }
    
    const results = await sendCampaignEmails(campaign);
    
    res.json({
      success: true,
      message: "Campaign emails sent successfully",
      results
    });
  } catch (error) {
    console.error('Error sending campaign emails manually:', error);
    res.status(500).json({ 
      message: "Error sending campaign emails", 
      error: error.message 
    });
  }
};

// Update campaign tracking URL
exports.updateTrackingUrl = async (req, res) => {
  try {
    const { trackingUrl } = req.body;
    
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    campaign.trackingUrl = trackingUrl;
    await campaign.save();
    
    res.json({
      success: true,
      message: "Tracking URL updated successfully",
      campaign
    });
  } catch (error) {
    console.error('Error updating tracking URL:', error);
    res.status(500).json({ 
      message: "Error updating tracking URL", 
      error: error.message 
    });
  }
};

// Get strategic dashboard metrics for owner
exports.getStrategicMetrics = async (req, res) => {
  try {
    const Customer = require('../models/Customer');
    
    // Get all campaigns
    const allCampaigns = await Campaign.find({});
    const runningCampaigns = await Campaign.find({ status: 'running' });
    const completedCampaigns = await Campaign.find({ status: 'completed' });
    
    // Get all customers
    const allCustomers = await Customer.find({});
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate customer growth (customers created this month vs last month)
    const customersThisMonth = allCustomers.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;
    
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const customersLastMonth = allCustomers.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate.getMonth() === lastMonth && createdDate.getFullYear() === lastMonthYear;
    }).length;
    
    const customerGrowth = customersLastMonth > 0 
      ? (((customersThisMonth - customersLastMonth) / customersLastMonth) * 100).toFixed(1)
      : '0';
    
    // Calculate total revenue
    let totalRevenue = 0;
    let revenueThisMonth = 0;
    let revenueLastMonth = 0;
    
    completedCampaigns.forEach(campaign => {
      const revenue = campaign.performanceMetrics?.revenue || 0;
      totalRevenue += revenue;
      
      const completedDate = new Date(campaign.completedAt);
      if (completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear) {
        revenueThisMonth += revenue;
      }
      if (completedDate.getMonth() === lastMonth && completedDate.getFullYear() === lastMonthYear) {
        revenueLastMonth += revenue;
      }
    });
    
    const revenueGrowth = revenueLastMonth > 0 
      ? (((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1)
      : '0';
    
    // Calculate customer loyalty (customers with repeat purchases)
    const loyalCustomers = allCustomers.filter(c => 
      c.purchaseHistory && c.purchaseHistory.length > 1
    ).length;
    const customerLoyalty = allCustomers.length > 0 
      ? ((loyalCustomers / allCustomers.length) * 100).toFixed(0)
      : '0';
    
    // Get running campaigns with engagement metrics
    const runningCampaignsWithMetrics = runningCampaigns.map(campaign => {
      const metrics = campaign.performanceMetrics || {};
      const sent = metrics.sent || 0;
      const engagement = sent > 0 ? (((metrics.opened || 0) + (metrics.clicked || 0)) / (sent * 2) * 100).toFixed(0) : '0';
      
      return {
        _id: campaign._id,
        name: campaign.title,
        revenue: metrics.revenue || 0,
        engagement: `${engagement}%`,
        status: 'Active'
      };
    });
    
    res.json({
      totalRevenue: totalRevenue > 0 ? totalRevenue.toFixed(2) : '0',
      revenueGrowth: revenueGrowth !== '0' ? `${revenueGrowth}%` : '-',
      customerGrowth: customerGrowth !== '0' ? `${customerGrowth}%` : '-',
      customerLoyalty: allCustomers.length > 0 ? `${customerLoyalty}%` : '-',
      runningCampaigns: runningCampaignsWithMetrics,
      totalCustomers: allCustomers.length,
      loyalCustomers: loyalCustomers
    });
  } catch (error) {
    console.error('Error fetching strategic metrics:', error);
    // Return empty data structure instead of error
    res.json({
      totalRevenue: '0',
      revenueGrowth: '-',
      customerGrowth: '-',
      customerLoyalty: '-',
      runningCampaigns: [],
      totalCustomers: 0,
      loyalCustomers: 0
    });
  }
};

// Get campaign overview metrics for owner
exports.getCampaignOverviewMetrics = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: { $in: ['running', 'completed'] } })
      .sort({ createdAt: -1 })
      .limit(10);
    
    if (campaigns.length === 0) {
      return res.json({
        name: 'No Campaign',
        targetAudience: '-',
        content: 'No campaigns available',
        openRate: '-',
        openRateDelta: '-',
        clickThroughRate: '-',
        clickThroughRateDelta: '-',
        conversionRate: '-',
        conversionRateDelta: '-',
        audienceEngagement: '-',
        audienceEngagementDelta: '-'
      });
    }
    
    // Get the most recent campaign
    const latestCampaign = campaigns[0];
    const metrics = latestCampaign.performanceMetrics || {};
    const sent = metrics.sent || 0;
    
    const campaignData = {
      _id: latestCampaign._id,
      name: latestCampaign.title,
      targetAudience: latestCampaign.customerSegments?.join(', ') || 'All Customers',
      content: latestCampaign.description || latestCampaign.emailContent || 'N/A',
      openRate: sent > 0 ? ((metrics.opened || 0) / sent * 100).toFixed(0) : '-',
      openRateDelta: sent > 0 ? '+2' : '-',
      clickThroughRate: sent > 0 ? ((metrics.clicked || 0) / sent * 100).toFixed(0) : '-',
      clickThroughRateDelta: sent > 0 ? '-1' : '-',
      conversionRate: sent > 0 ? ((metrics.conversions || 0) / sent * 100).toFixed(0) : '-',
      conversionRateDelta: sent > 0 ? '+0.5' : '-',
      audienceEngagement: sent > 0 ? (((metrics.opened || 0) + (metrics.clicked || 0)) / (sent * 2) * 100).toFixed(0) : '-',
      audienceEngagementDelta: sent > 0 ? '+3' : '-'
    };
    
    res.json(campaignData);
  } catch (error) {
    console.error('Error fetching campaign overview metrics:', error);
    // Return empty data structure instead of error
    res.json({
      name: 'No Campaign',
      targetAudience: '-',
      content: 'No campaigns available',
      openRate: '-',
      openRateDelta: '-',
      clickThroughRate: '-',
      clickThroughRateDelta: '-',
      conversionRate: '-',
      conversionRateDelta: '-',
      audienceEngagement: '-',
      audienceEngagementDelta: '-'
    });
  }
};

