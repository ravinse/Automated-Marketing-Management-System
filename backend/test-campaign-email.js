require('dotenv').config();
const { sendEmail } = require('./utils/emailService');

// Test email with button
const testEmailWithButton = async () => {
  console.log('📧 Testing email with tracking button...\n');
  
  const htmlContent = `
    Dear Valued Customer, 
    
    The festive season is here — and so are our amazing deals! 
    Enjoy special discounts, bundle offers, and surprise gifts across all your favorite products.
  `;
  
  try {
    const result = await sendEmail(
      process.env.EMAIL_USER, // Send to self for testing
      'Test Email - Marketing Campaign with Button',
      htmlContent,
      null,
      'TEST_CAMPAIGN_ID',
      'TEST_CUSTOMER_ID'
    );
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('📬 Check your inbox:', process.env.EMAIL_USER);
      console.log('📧 Message ID:', result.messageId);
      console.log('\n🔍 The email should contain:');
      console.log('   - Your campaign message');
      console.log('   - A green "🛍️ Visit Our Website" button');
      console.log('   - Invisible tracking pixel');
    } else {
      console.log('❌ Failed to send email:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
};

testEmailWithButton();
