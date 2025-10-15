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
 * Send email to a single recipient
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email body in HTML format
 * @param {string} textContent - Email body in plain text format (optional)
 * @returns {Promise<object>} - Email send result
 */
const sendEmail = async (to, subject, htmlContent, textContent = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Marketing System'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
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
