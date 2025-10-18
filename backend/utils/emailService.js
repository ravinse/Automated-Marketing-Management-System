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
    
    // Wrap plain text content in HTML if needed with professional styling
    if (!finalHtmlContent.includes('<html') && !finalHtmlContent.includes('<body')) {
      console.log('  ✅ Wrapping content in HTML structure');
      finalHtmlContent = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Marketing Campaign</title>
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
                          🎯 Special Message for You
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content Section -->
                    <tr>
                      <td class="content-wrapper" style="padding: 40px 30px; color: #333333; font-size: 16px; line-height: 1.8;">
                        <div style="text-align: left;">
                          ${finalHtmlContent}
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
    
    // Inject tracking if campaignId and customerId are provided
    if (campaignId && customerId) {
      const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
      
      // Add sample call-to-action button if no links exist
      if (!finalHtmlContent.includes('<a ') && !finalHtmlContent.includes('href=')) {
        console.log('  ✅ Adding CTA button (no links found)');
        
        // Professional, attractive CTA button
        const ctaButton = `
          <!-- CTA Button Section -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center" style="border-radius: 6px; background: linear-gradient(135deg, #00AF96 0%, #00D9B5 100%); box-shadow: 0 4px 15px rgba(0, 175, 150, 0.3);">
                      <a href="http://localhost:5174" target="_blank" 
                         style="font-size: 16px; 
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                                color: #ffffff; 
                                text-decoration: none; 
                                padding: 16px 50px; 
                                display: inline-block; 
                                font-weight: 600;
                                letter-spacing: 0.5px;
                                text-transform: uppercase;
                                transition: all 0.3s ease;">
                        🛒 Shop Now
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
        
        // Insert button before content wrapper closing tag or body tag
        if (finalHtmlContent.includes('</div>')) {
          // Find the last closing div (content wrapper) and insert before it
          const lastDivIndex = finalHtmlContent.lastIndexOf('</div>');
          finalHtmlContent = finalHtmlContent.substring(0, lastDivIndex) + ctaButton + finalHtmlContent.substring(lastDivIndex);
        } else if (finalHtmlContent.includes('</td>')) {
          // Insert before content wrapper closing
          const contentTdIndex = finalHtmlContent.indexOf('</td>', finalHtmlContent.indexOf('content-wrapper'));
          if (contentTdIndex > -1) {
            finalHtmlContent = finalHtmlContent.substring(0, contentTdIndex) + ctaButton + finalHtmlContent.substring(contentTdIndex);
          }
        } else if (finalHtmlContent.includes('</body>')) {
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
