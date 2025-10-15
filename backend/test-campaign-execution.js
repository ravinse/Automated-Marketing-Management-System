/**
 * Test Campaign Execution
 * 
 * This script tests the campaign execution functionality by:
 * 1. Creating test customers with different segments
 * 2. Creating a test campaign targeting a specific segment
 * 3. Executing the campaign to send emails/SMS
 * 
 * Run: node backend/test-campaign-execution.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const Campaign = require('./models/Campaign');
const { executeCampaignAutomatically } = require('./utils/campaignScheduler');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create test customers
const createTestCustomers = async () => {
  console.log('\n📝 Creating test customers...');
  
  const testCustomers = [
    {
      name: 'Alice Premium',
      email: 'alice@test.com',
      phone: '+1234567890',
      segment: 'Premium',
      preferences: ['electronics', 'fashion'],
      purchaseHistory: [{
        product: 'Laptop',
        amount: 1200,
        date: new Date('2025-09-15')
      }]
    },
    {
      name: 'Bob Premium',
      email: 'bob@test.com',
      phone: '+1234567891',
      segment: 'Premium',
      preferences: ['sports', 'books'],
      purchaseHistory: [{
        product: 'Phone',
        amount: 800,
        date: new Date('2025-09-20')
      }]
    },
    {
      name: 'Charlie Regular',
      email: 'charlie@test.com',
      phone: '+1234567892',
      segment: 'Regular',
      preferences: ['home', 'garden'],
      purchaseHistory: [{
        product: 'Shoes',
        amount: 100,
        date: new Date('2025-10-01')
      }]
    }
  ];

  const createdCustomers = [];
  
  for (const customerData of testCustomers) {
    try {
      // Check if customer already exists
      let customer = await Customer.findOne({ email: customerData.email });
      
      if (!customer) {
        customer = new Customer(customerData);
        await customer.save();
        console.log(`✅ Created customer: ${customer.name} (${customer.segment})`);
      } else {
        console.log(`ℹ️ Customer already exists: ${customer.name} (${customer.segment})`);
      }
      
      createdCustomers.push(customer);
    } catch (error) {
      console.error(`❌ Error creating customer ${customerData.name}:`, error.message);
    }
  }

  return createdCustomers;
};

// Create test campaign
const createTestCampaign = async () => {
  console.log('\n📝 Creating test campaign...');
  
  const campaignData = {
    title: 'Premium Customer Flash Sale',
    description: 'Exclusive flash sale for our premium customers - 50% off on all electronics!',
    customerSegments: ['Premium'],
    emailSubject: '🎉 Flash Sale: 50% Off for Premium Members!',
    emailContent: `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #4CAF50;">🎉 Exclusive Flash Sale!</h1>
            <p style="font-size: 16px; line-height: 1.6;">
              Dear Premium Customer,
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              We're excited to offer you an <strong>exclusive 50% discount</strong> on all electronics in our store!
            </p>
            <div style="background-color: #4CAF50; color: white; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin: 0;">50% OFF</h2>
              <p style="margin: 5px 0;">Use code: <strong>PREMIUM50</strong></p>
            </div>
            <p style="font-size: 16px; line-height: 1.6;">
              This offer is valid for 48 hours only. Don't miss out!
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              Best regards,<br>
              <strong>Marketing Team</strong>
            </p>
          </div>
        </body>
      </html>
    `,
    smsContent: '🎉 Flash Sale Alert! Premium members get 50% OFF on electronics. Use code PREMIUM50. Valid 48hrs only!',
    startDate: new Date(),
    endDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
    status: 'running',
    createdBy: 'test-script',
    currentStep: 'content'
  };

  try {
    const campaign = new Campaign(campaignData);
    await campaign.save();
    console.log(`✅ Created campaign: ${campaign.title}`);
    console.log(`   Campaign ID: ${campaign._id}`);
    console.log(`   Target Segment: ${campaign.customerSegments.join(', ')}`);
    return campaign;
  } catch (error) {
    console.error('❌ Error creating campaign:', error.message);
    return null;
  }
};

// Execute the test campaign
const testCampaignExecution = async (campaign) => {
  console.log('\n🚀 Executing test campaign...');
  console.log(`   Campaign: ${campaign.title}`);
  console.log(`   Email Subject: ${campaign.emailSubject}`);
  
  try {
    const result = await executeCampaignAutomatically(campaign);
    
    if (result.success) {
      console.log('\n✅ Campaign executed successfully!');
      console.log(`   Total Customers: ${result.totalCustomers}`);
      console.log(`   Emails Sent: ${result.emailsSent}`);
      console.log(`   SMS Sent: ${result.smsSent}`);
      
      // Fetch updated campaign
      const updatedCampaign = await Campaign.findById(campaign._id);
      console.log('\n📊 Updated Performance Metrics:');
      console.log(`   Sent: ${updatedCampaign.performanceMetrics.sent}`);
      console.log(`   Delivered: ${updatedCampaign.performanceMetrics.delivered}`);
    } else {
      console.log('\n❌ Campaign execution failed');
      console.log(`   Reason: ${result.reason || result.error}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error executing campaign:', error.message);
    return { success: false, error: error.message };
  }
};

// Main test function
const runTest = async () => {
  console.log('🧪 Starting Campaign Execution Test\n');
  console.log('='.repeat(50));
  
  try {
    // Connect to database
    await connectDB();
    
    // Create test customers
    const customers = await createTestCustomers();
    
    if (customers.length === 0) {
      console.log('\n❌ No customers created. Exiting...');
      process.exit(1);
    }
    
    // Create test campaign
    const campaign = await createTestCampaign();
    
    if (!campaign) {
      console.log('\n❌ Campaign creation failed. Exiting...');
      process.exit(1);
    }
    
    // Execute campaign
    await testCampaignExecution(campaign);
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Test completed successfully!');
    console.log('\n💡 Tips:');
    console.log('   - Check the console logs above for detailed execution info');
    console.log('   - If using mock email/SMS, check the console for [MOCK] messages');
    console.log('   - Configure EMAIL_* env variables for real email sending');
    console.log('   - Configure TWILIO_* env variables for real SMS sending');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
};

// Run the test
runTest();
