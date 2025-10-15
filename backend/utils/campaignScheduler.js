const Campaign = require('../models/Campaign');
const Customer = require('../models/Customer');
const { sendBatchEmails } = require('./emailService');
const { sendBatchSMS } = require('./smsService');

/**
 * Execute campaign - send emails/SMS to targeted customers
 */
const executeCampaignAutomatically = async (campaign) => {
  try {
    console.log(`🚀 Auto-executing campaign: ${campaign.title} (ID: ${campaign._id})`);

    // Get targeted customers
    let customers = [];
    
    if (campaign.targetedCustomerIds && campaign.targetedCustomerIds.length > 0) {
      customers = await Customer.find({
        _id: { $in: campaign.targetedCustomerIds }
      });
    } else if (campaign.customerSegments && campaign.customerSegments.length > 0) {
      customers = await Customer.find({
        segment: { $in: campaign.customerSegments }
      });
    }

    if (customers.length === 0) {
      console.log(`⚠️ No customers found for campaign: ${campaign.title}`);
      return { success: false, reason: 'No customers found' };
    }

    console.log(`📧 Found ${customers.length} customers for campaign execution`);

    let emailsSent = 0;
    let smsSent = 0;

    // Send emails if email content is provided
    if (campaign.emailSubject && campaign.emailContent) {
      const emailRecipients = customers
        .filter(customer => customer.email)
        .map(customer => ({
          email: customer.email,
          subject: campaign.emailSubject,
          content: campaign.emailContent,
        }));

      if (emailRecipients.length > 0) {
        const emailResults = await sendBatchEmails(
          emailRecipients,
          campaign.emailSubject,
          campaign.emailContent
        );
        emailsSent = emailResults.sent;
        console.log(`✉️ Emails sent: ${emailsSent}/${emailResults.total}`);
      }
    }

    // Send SMS if SMS content is provided
    if (campaign.smsContent) {
      const smsRecipients = customers
        .filter(customer => customer.phone)
        .map(customer => ({
          phone: customer.phone,
          message: campaign.smsContent,
        }));

      if (smsRecipients.length > 0) {
        const smsResults = await sendBatchSMS(
          smsRecipients,
          campaign.smsContent
        );
        smsSent = smsResults.sent;
        console.log(`📱 SMS sent: ${smsSent}/${smsResults.total}`);
      }
    }

    // Update campaign performance metrics
    const totalSent = emailsSent + smsSent;
    campaign.performanceMetrics = {
      ...campaign.performanceMetrics,
      sent: (campaign.performanceMetrics.sent || 0) + totalSent,
      delivered: (campaign.performanceMetrics.delivered || 0) + totalSent,
    };

    await campaign.save();

    console.log(`✅ Campaign executed successfully: ${campaign.title}`);
    return { 
      success: true, 
      emailsSent, 
      smsSent, 
      totalCustomers: customers.length 
    };
  } catch (error) {
    console.error(`✗ Error executing campaign ${campaign.title}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Check and start approved campaigns that have reached their start date
 */
const checkAndStartScheduledCampaigns = async () => {
  try {
    const now = new Date();
    
    // Find all approved campaigns where start date has arrived
    const scheduledCampaigns = await Campaign.find({
      status: 'approved',
      startDate: { $lte: now }
    });

    let startedCount = 0;
    
    if (scheduledCampaigns.length > 0) {
      for (const campaign of scheduledCampaigns) {
        // Update status to running
        campaign.status = 'running';
        await campaign.save();
        
        console.log(`▶️ Started campaign: ${campaign.title} (ID: ${campaign._id})`);
        
        // Execute the campaign (send emails/SMS)
        await executeCampaignAutomatically(campaign);
        
        startedCount++;
      }
      console.log(`✓ Successfully started and executed ${startedCount} scheduled campaigns`);
    }
    
    return startedCount;
  } catch (error) {
    console.error('✗ Error checking scheduled campaigns:', error);
    return 0;
  }
};

/**
 * Check and complete expired campaigns
 * This function runs periodically to check if any running campaigns have passed their end date
 */
const checkAndCompleteExpiredCampaigns = async () => {
  try {
    const now = new Date();
    
    // Find all running campaigns where end date has passed
    const expiredCampaigns = await Campaign.find({
      status: 'running',
      endDate: { $lte: now }
    });

    // Update all expired campaigns to completed
    const completedCount = expiredCampaigns.length;
    
    if (completedCount > 0) {
      for (const campaign of expiredCampaigns) {
        campaign.status = 'completed';
        campaign.completedAt = now;
        await campaign.save();
        console.log(`✓ Completed campaign: ${campaign.title} (ID: ${campaign._id})`);
      }
      console.log(`✓ Successfully completed ${completedCount} expired campaigns`);
    }
    
    return completedCount;
  } catch (error) {
    console.error('✗ Error checking expired campaigns:', error);
    return 0;
  }
};

/**
 * Run all scheduled campaign checks
 */
const runScheduledChecks = async () => {
  console.log('🔄 Running scheduled campaign checks...');
  await checkAndStartScheduledCampaigns();
  await checkAndCompleteExpiredCampaigns();
};

/**
 * Start the campaign scheduler
 * Checks for scheduled and expired campaigns every 5 minutes
 */
const startCampaignScheduler = () => {
  console.log('📅 Campaign scheduler started - checking every 5 minutes');
  
  // Run immediately on startup
  runScheduledChecks();
  
  // Run every 5 minutes (300000 milliseconds)
  const schedulerInterval = setInterval(runScheduledChecks, 5 * 60 * 1000);
  
  return schedulerInterval;
};

/**
 * Stop the campaign scheduler
 */
const stopCampaignScheduler = (schedulerInterval) => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    console.log('📅 Campaign scheduler stopped');
  }
};

module.exports = {
  checkAndCompleteExpiredCampaigns,
  checkAndStartScheduledCampaigns,
  executeCampaignAutomatically,
  startCampaignScheduler,
  stopCampaignScheduler,
  runScheduledChecks
};
