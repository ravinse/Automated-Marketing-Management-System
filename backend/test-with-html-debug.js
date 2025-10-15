require('dotenv').config();
const { sendEmail } = require('./utils/emailService');
const fs = require('fs');

// Test email with button and save HTML
const testEmailWithButton = async () => {
  console.log('📧 Testing email with tracking button...\n');
  
  const htmlContent = `
    Dear Valued Customer, 
    
    The festive season is here — and so are our amazing deals! 
    Enjoy special discounts, bundle offers, and surprise gifts across all your favorite products.
  `;
  
  // Manually create the expected HTML
  const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
  const campaignId = 'TEST_CAMPAIGN_ID';
  const customerId = 'TEST_CUSTOMER_ID';
  
  const fullHtml = `
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    ${htmlContent}
    
    <div style="margin-top: 30px; text-align: center;">
      <a href="${baseUrl}/api/tracking/click/${campaignId}/${customerId}?url=${encodeURIComponent('http://localhost:5174')}" 
         style="display: inline-block; padding: 15px 40px; background-color: #00AF96; 
                color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        🛍️ Visit Our Website
      </a>
    </div>
    
    <img src="${baseUrl}/api/tracking/open/${campaignId}/${customerId}" width="1" height="1" style="display:none;" alt="" />
  </body>
</html>
  `;
  
  // Save to file to inspect
  fs.writeFileSync('test-email-output.html', fullHtml);
  console.log('📄 HTML saved to: test-email-output.html\n');
  
  try {
    const result = await sendEmail(
      process.env.EMAIL_USER,
      'Test Email - WITH BUTTON',
      htmlContent,
      null,
      campaignId,
      customerId
    );
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('📬 Check your inbox:', process.env.EMAIL_USER);
      console.log('📧 Subject: Test Email - WITH BUTTON');
      console.log('📧 Message ID:', result.messageId);
      console.log('\n🔍 Look for the GREEN BUTTON in the email!');
    } else {
      console.log('❌ Failed to send email:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
};

testEmailWithButton();
