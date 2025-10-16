#!/usr/bin/env node
/**
 * Test Script for Campaign Auto-Execution
 * 
 * This script tests the campaign scheduler functionality
 * Run: node test-campaign-execution.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Campaign = require('./models/Campaign');

async function testCampaignScheduler() {
  console.log('🧪 Testing Campaign Auto-Execution System\n');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Test 1: Check for approved campaigns
    console.log('📋 Test 1: Checking for approved campaigns...');
    const approvedCampaigns = await Campaign.find({ status: 'approved' });
    console.log(`   Found ${approvedCampaigns.length} approved campaign(s)`);
    
    if (approvedCampaigns.length > 0) {
      approvedCampaigns.forEach(c => {
        const now = new Date();
        const startDate = new Date(c.startDate);
        const diff = startDate - now;
        const minutesUntil = Math.round(diff / 60000);
        
        console.log(`   - ${c.title}`);
        console.log(`     Status: ${c.status}`);
        console.log(`     Start Date: ${c.startDate}`);
        console.log(`     Time until execution: ${minutesUntil} minutes`);
        console.log(`     Customer IDs: ${c.targetedCustomerIds?.length || 0}`);
      });
    }
    console.log();
    
    // Test 2: Check for campaigns that should be running
    console.log('📋 Test 2: Checking for campaigns that should be running...');
    const now = new Date();
    const shouldBeRunning = await Campaign.find({
      status: 'approved',
      startDate: { $lte: now }
    });
    console.log(`   Found ${shouldBeRunning.length} campaign(s) that should be running`);
    
    if (shouldBeRunning.length > 0) {
      console.log('   ⚠️  These campaigns should already be executing!');
      shouldBeRunning.forEach(c => {
        console.log(`   - ${c.title} (scheduled for ${c.startDate})`);
      });
    }
    console.log();
    
    // Test 3: Check running campaigns
    console.log('📋 Test 3: Checking running campaigns...');
    const runningCampaigns = await Campaign.find({ status: 'running' });
    console.log(`   Found ${runningCampaigns.length} running campaign(s)`);
    
    if (runningCampaigns.length > 0) {
      runningCampaigns.forEach(c => {
        const endDate = new Date(c.endDate);
        const diff = endDate - now;
        const minutesUntil = Math.round(diff / 60000);
        
        console.log(`   - ${c.title}`);
        console.log(`     End Date: ${c.endDate}`);
        console.log(`     Time until completion: ${minutesUntil} minutes`);
      });
    }
    console.log();
    
    // Test 4: Check scheduler configuration
    console.log('📋 Test 4: Checking scheduler configuration...');
    const enableSchedulers = process.env.ENABLE_SCHEDULERS;
    console.log(`   ENABLE_SCHEDULERS: ${enableSchedulers}`);
    
    if (enableSchedulers !== 'true') {
      console.log('   ⚠️  WARNING: Schedulers are disabled!');
      console.log('   Add ENABLE_SCHEDULERS=true to your .env file');
    } else {
      console.log('   ✅ Schedulers are enabled');
    }
    console.log();
    
    // Test 5: Check MongoDB configuration for segmentation
    console.log('📋 Test 5: Checking segmentation database configuration...');
    console.log(`   MONGO_URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ Not set'}`);
    console.log(`   SEGMENTATION_DB: ${process.env.SEGMENTATION_DB || 'retail_db (default)'}`);
    console.log(`   ORDERS_COLLECTION: ${process.env.ORDERS_COLLECTION || 'newdatabase (default)'}`);
    console.log();
    
    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Total approved campaigns: ${approvedCampaigns.length}`);
    console.log(`Campaigns ready to execute: ${shouldBeRunning.length}`);
    console.log(`Currently running: ${runningCampaigns.length}`);
    console.log(`Scheduler enabled: ${enableSchedulers === 'true' ? 'Yes' : 'No'}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log();
    
    if (shouldBeRunning.length > 0 && enableSchedulers !== 'true') {
      console.log('⚠️  ACTION REQUIRED:');
      console.log('   1. Add ENABLE_SCHEDULERS=true to .env');
      console.log('   2. Restart the backend server');
      console.log('   3. Campaigns will auto-execute within 1 minute\n');
    } else if (shouldBeRunning.length > 0) {
      console.log('⚠️  Campaigns are waiting to execute!');
      console.log('   They should auto-execute within 1 minute of scheduler check\n');
    } else if (approvedCampaigns.length > 0) {
      console.log('✅ System is ready!');
      console.log('   Approved campaigns will execute at their scheduled time\n');
    } else {
      console.log('ℹ️  No approved campaigns found');
      console.log('   Create and approve a campaign to test auto-execution\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testCampaignScheduler();
