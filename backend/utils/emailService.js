const nodemailer = require('nodemailer');

// Create transporter for sending emails
// You'll need to configure these with actual email service credentials
const createTransporter = () => {
  // For development, you can use Gmail or a test service like Ethereal
  // For production, use services like SendGrid, AWS SES, Mailgun, etc.
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASSWORD, // Your email password or app password
    },
    // Uncomment for debugging
    // logger: true,
    // debug: true,
  });
};

/**
 * Send email to a single recipient with tracking
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email body in HTML format
 * @param {string} textContent - Email body in plain text format (optional)
 * @param {string} campaignId - Campaign ID for tracking (optional)
 * @param {string} customerId - Customer ID for tracking (optional)
 * @returns {Promise<object>} - Email send result
 */
const sendEmail = async (to, subject, htmlContent, textContent = null, campaignId = null, customerId = null) => {
  try {
    const transporter = createTransporter();
    
    // Prepare HTML content with proper structure
    let finalHtmlContent = htmlContent;
    
    console.log('📧 SendEmail Debug:');
    console.log('  - Has campaignId:', !!campaignId);
    console.log('  - Has customerId:', !!customerId);
    console.log('  - Original content length:', htmlContent.length);
    console.log('  - Has <html tag:', htmlContent.includes('<html'));
    console.log('  - Has <a tag:', htmlContent.includes('<a '));
    
    // Wrap plain text content in HTML if needed
    if (!finalHtmlContent.includes('<html') && !finalHtmlContent.includes('<body')) {
      console.log('  ✅ Wrapping content in HTML structure');
      finalHtmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            ${finalHtmlContent}
          </body>
        </html>
      `;
    }
    
    // Inject tracking if campaignId and customerId are provided
    if (campaignId && customerId) {
      const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
      
      // Add sample call-to-action button if no links exist
      if (!finalHtmlContent.includes('<a ') && !finalHtmlContent.includes('href=')) {
        console.log('  ✅ Adding CTA button (no links found)');
        
        // Simple, Gmail-friendly button
        const ctaButton = `
          <br><br>
          <div style="text-align: center; margin: 20px 0;">
            <table cellspacing="0" cellpadding="0" border="0" align="center">
              <tr>
                <td align="center" bgcolor="#00AF96" style="border-radius: 5px;">
                  <a href="http://localhost:5174" target="_blank" 
                     style="font-size: 16px; 
                            font-family: Arial, sans-serif; 
                            color: #ffffff; 
                            text-decoration: none; 
                            padding: 15px 40px; 
                            display: inline-block; 
                            font-weight: bold;">
                    🛒 Visit Our Website
                  </a>
                </td>
              </tr>
            </table>
          </div>
          <br>
        `;
        
        // Insert button before closing body tag
        if (finalHtmlContent.includes('</body>')) {
          finalHtmlContent = finalHtmlContent.replace('</body>', `${ctaButton}</body>`);
        } else {
          finalHtmlContent += ctaButton;
        }
      } else {
        console.log('  ⚠️ Skipping button (links already exist)');
      }
      
      // Add tracking pixel at the end of email
      const trackingPixel = `<img src="${baseUrl}/api/tracking/open/${campaignId}/${customerId}" width="1" height="1" style="display:none;" alt="" />`;
      
      // Convert all links to tracking links
      const linksBefore = (finalHtmlContent.match(/<a /gi) || []).length;
      finalHtmlContent = finalHtmlContent.replace(
        /<a\s+([^>]*href=["']([^"']+)["'][^>]*)>/gi,
        (match, attrs, url) => {
          const trackingUrl = `${baseUrl}/api/tracking/click/${campaignId}/${customerId}?url=${encodeURIComponent(url)}`;
          return `<a ${attrs.replace(url, trackingUrl)}>`;
        }
      );
      const linksAfter = (finalHtmlContent.match(/<a /gi) || []).length;
      console.log(`  ✅ Converted ${linksAfter} links to tracking links`);
      
      // Add tracking pixel before closing body tag or at the end
      if (finalHtmlContent.includes('</body>')) {
        finalHtmlContent = finalHtmlContent.replace('</body>', `${trackingPixel}</body>`);
      } else {
        finalHtmlContent += trackingPixel;
      }
      console.log('  ✅ Added tracking pixel');
    }
    
    console.log('  - Final content length:', finalHtmlContent.length);
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Marketing System'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: finalHtmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent to ${to}: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: to,
    };
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
      recipient: to,
    };
  }
};

/**
 * Send emails to multiple recipients (batch)
 * @param {Array<object>} recipients - Array of recipients with email, subject, and content
 * @param {string} defaultSubject - Default subject if not specified per recipient
 * @param {string} defaultContent - Default content if not specified per recipient
 * @returns {Promise<object>} - Summary of email send results
 */
const sendBatchEmails = async (recipients, defaultSubject, defaultContent) => {
  const results = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    details: [],
  };

  // Send emails with a small delay to avoid rate limiting
  for (const recipient of recipients) {
    const subject = recipient.subject || defaultSubject;
    const content = recipient.content || defaultContent;
    
    const result = await sendEmail(recipient.email, subject, content);
    
    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
    }
    
    results.details.push({
      email: recipient.email,
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    });

    // Small delay between emails (adjust based on your email provider's limits)
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
};

/**
 * Verify email configuration
 * @returns {Promise<boolean>} - Whether email service is properly configured
 */
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email service is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email service configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendBatchEmails,
  verifyEmailConfig,
};
