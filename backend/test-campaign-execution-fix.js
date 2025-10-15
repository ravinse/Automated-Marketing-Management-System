const fetch = require('node-fetch');

const API_URL = 'http://localhost:5001/api';

async function testCampaignExecution() {
  console.log('🧪 Testing Campaign Execution Fix\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: Get all approved campaigns
    console.log('\n📋 Step 1: Fetching approved campaigns...');
    const campaignsResponse = await fetch(`${API_URL}/campaigns?status=approved`);
    
    if (!campaignsResponse.ok) {
      throw new Error(`Failed to fetch campaigns: ${campaignsResponse.statusText}`);
    }
    
    const campaignsData = await campaignsResponse.json();
    const approvedCampaigns = campaignsData.items || [];
    
    console.log(`   Found ${approvedCampaigns.length} approved campaign(s)`);
    
    if (approvedCampaigns.length === 0) {
      console.log('\n⚠️  No approved campaigns found to test.');
      console.log('   Please approve a campaign first and try again.');
      return;
    }

    // Display campaigns
    console.log('\n   Approved Campaigns:');
    approvedCampaigns.forEach((campaign, index) => {
      console.log(`   ${index + 1}. ${campaign.title} (ID: ${campaign._id})`);
      console.log(`      - Status: ${campaign.status}`);
      console.log(`      - Target Count: ${campaign.targetedCustomerCount || 0}`);
      console.log(`      - Customer Segments: ${campaign.customerSegments?.join(', ') || 'None'}`);
      console.log(`      - Has Email Content: ${campaign.emailSubject ? 'Yes' : 'No'}`);
      console.log(`      - Has SMS Content: ${campaign.smsContent ? 'Yes' : 'No'}`);
    });

    // Step 2: Test executing the first campaign
    const testCampaign = approvedCampaigns[0];
    console.log('\n═'.repeat(60));
    console.log(`\n🚀 Step 2: Testing execution of campaign: "${testCampaign.title}"`);
    console.log(`   Campaign ID: ${testCampaign._id}`);
    
    // Check if campaign has targeted customer IDs
    if (!testCampaign.targetedCustomerIds || testCampaign.targetedCustomerIds.length === 0) {
      console.log('\n❌ ERROR: Campaign has no targetedCustomerIds!');
      console.log('   This campaign was likely created before the customer targeting was saved.');
      console.log('   Please recreate the campaign with proper customer targeting.');
      return;
    }
    
    console.log(`   Targeted Customer IDs: ${testCampaign.targetedCustomerIds.length} customers`);
    console.log(`   First few IDs: ${testCampaign.targetedCustomerIds.slice(0, 3).join(', ')}`);
    
    // Execute the campaign
    console.log('\n   Executing campaign...');
    const executeResponse = await fetch(`${API_URL}/campaigns/execute/${testCampaign._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const executeData = await executeResponse.json();
    
    if (!executeResponse.ok) {
      console.log('\n❌ EXECUTION FAILED:');
      console.log(`   Status: ${executeResponse.status}`);
      console.log(`   Message: ${executeData.message}`);
      console.log(`   Error: ${executeData.error}`);
      return;
    }

    // Success!
    console.log('\n✅ EXECUTION SUCCESSFUL!');
    console.log('\n📊 Execution Results:');
    console.log(`   Total Customers: ${executeData.executionResults.totalCustomers}`);
    
    if (executeData.executionResults.emails) {
      console.log(`   Emails:`);
      console.log(`     - Sent: ${executeData.executionResults.emails.sent}`);
      console.log(`     - Failed: ${executeData.executionResults.emails.failed}`);
      console.log(`     - Total: ${executeData.executionResults.emails.total}`);
    }
    
    if (executeData.executionResults.sms) {
      console.log(`   SMS:`);
      console.log(`     - Sent: ${executeData.executionResults.sms.sent}`);
      console.log(`     - Failed: ${executeData.executionResults.sms.failed}`);
      console.log(`     - Total: ${executeData.executionResults.sms.total}`);
    }
    
    console.log(`   Started At: ${executeData.executionResults.startedAt}`);
    console.log(`   Completed At: ${executeData.executionResults.completedAt}`);
    console.log(`   New Campaign Status: ${executeData.campaign.status}`);

    console.log('\n═'.repeat(60));
    console.log('\n🎉 Campaign execution test completed successfully!');
    console.log('   The fix is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('   Error details:', error);
  }
}

// Run the test
testCampaignExecution()
  .then(() => {
    console.log('\n✅ Test script completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });
