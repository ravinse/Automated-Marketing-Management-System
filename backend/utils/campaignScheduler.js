const Campaign = require('../models/Campaign');

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
 * Start the campaign scheduler
 * Checks for expired campaigns every 5 minutes
 */
const startCampaignScheduler = () => {
  console.log('📅 Campaign scheduler started - checking every 5 minutes');
  
  // Run immediately on startup
  checkAndCompleteExpiredCampaigns();
  
  // Run every 5 minutes (300000 milliseconds)
  const schedulerInterval = setInterval(checkAndCompleteExpiredCampaigns, 5 * 60 * 1000);
  
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
  startCampaignScheduler,
  stopCampaignScheduler
};
