// Cron job scheduler for automated tasks
const cron = require('node-cron');
// Import ML segmentation sync function
const { syncNewCustomers } = require('./autoSegmentation');

/**
 * ML Customer Segmentation Scheduler
 * Automatically syncs new customers from orders to segmentation using ML algorithms
 * Runs periodically to ensure all customers are segmented
 */

// ========================================
// SCHEDULER STATE
// ========================================
// Prevents overlapping sync operations
let isRunning = false;

// ========================================
// SYNC EXECUTION FUNCTION
// ========================================
// Executes the ML segmentation sync with duplicate prevention
async function runSync() {
  // Skip if another sync is already running
  if (isRunning) {
    console.log('⏳ [ML-Segmentation] Sync already in progress, skipping...');
    return;
  }

  try {
    isRunning = true;
    console.log('\n🔄 [ML-Segmentation] Starting scheduled sync...');
    console.log('⏰ Time:', new Date().toISOString());
    
    const result = await syncNewCustomers();
    
    if (result.added > 0) {
      console.log(`✅ [ML-Segmentation] Added ${result.added} new customer(s) to segmentation`);
    } else {
      console.log('✅ [ML-Segmentation] All customers are already segmented');
    }
  } catch (error) {
    console.error('❌ [ML-Segmentation] Sync failed:', error.message);
  } finally {
    isRunning = false;
  }
}

// ========================================
// SCHEDULER START FUNCTION
// ========================================
/**
 * Start the ML segmentation scheduler
 * Default: Runs every 1 minute
 * You can customize the schedule using cron syntax
 * 
 * @param {string} schedule - Cron expression (default: '*/1 * * * *')
 * @returns {Object} Cron task object
 */
function startSegmentationScheduler(schedule = '*/1 * * * *') {
  console.log('📅 ML Customer segmentation scheduler started');
  console.log(`⏰ Schedule: Every 1 minute (${schedule})`);
  console.log('🔄 The system will automatically segment new customers using ML algorithms\n');

  // Execute sync immediately on startup to process any pending customers
  runSync();

  // ========================================
  // CRON JOB CONFIGURATION
  // ========================================
  // Schedule periodic sync operations using cron syntax
  // Cron format: minute hour day month dayOfWeek
  // */1 * * * * = every 1 minute
  // */5 * * * * = every 5 minutes
  // */30 * * * * = every 30 minutes
  // 0 * * * * = every hour at minute 0
  // 0 */2 * * * = every 2 hours
  // 0 0 * * * = every day at midnight
  const task = cron.schedule(schedule, () => {
    runSync();
  });

  return task;
}

// ========================================
// MANUAL SYNC TRIGGER
// ========================================
/**
 * Run sync manually (useful for API endpoints)
 * Allows on-demand segmentation updates
 * 
 * @returns {Promise} Result of sync operation
 */
async function runManualSync() {
  console.log('🔧 [ML-Segmentation] Manual sync triggered');
  return await runSync();
}

module.exports = {
  startSegmentationScheduler,
  runManualSync
};
