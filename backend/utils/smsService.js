// SMS Service using Twilio (you can also use other providers like AWS SNS, Vonage, etc.)
// Note: You'll need to install twilio package: npm install twilio

/**
 * Send SMS to a single recipient
 * Note: This is a placeholder implementation. To use it, you need to:
 * 1. Install Twilio: npm install twilio
 * 2. Set up environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 * 3. Uncomment the Twilio implementation below
 * 
 * @param {string} to - Recipient phone number (E.164 format: +1234567890)
 * @param {string} message - SMS message content
 * @returns {Promise<object>} - SMS send result
 */
const sendSMS = async (to, message) => {
  try {
    // Validate phone number format
    if (!to || !to.startsWith('+')) {
      console.warn(`Invalid phone number format: ${to}. Phone numbers should be in E.164 format (e.g., +1234567890)`);
      return {
        success: false,
        error: 'Invalid phone number format',
        recipient: to,
      };
    }

    // Validate message length (SMS is typically limited to 160 characters for a single message)
    if (!message || message.length === 0) {
      return {
        success: false,
        error: 'Message cannot be empty',
        recipient: to,
      };
    }

    // OPTION 1: Twilio Implementation (Recommended for production)
    // Uncomment the following code and install twilio package to enable SMS sending
    /*
    const twilio = require('twilio');
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const client = twilio(accountSid, authToken);

    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    });

    console.log(`SMS sent to ${to}: ${result.sid}`);

    return {
      success: true,
      messageId: result.sid,
      recipient: to,
      status: result.status,
    };
    */

    // OPTION 2: Mock Implementation (for development/testing)
    // Remove this in production and use a real SMS provider
    console.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
    
    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recipient: to,
      status: 'mock_sent',
    };

  } catch (error) {
    console.error(`Error sending SMS to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
      recipient: to,
    };
  }
};

/**
 * Send SMS to multiple recipients (batch)
 * @param {Array<object>} recipients - Array of recipients with phone and message
 * @param {string} defaultMessage - Default message if not specified per recipient
 * @returns {Promise<object>} - Summary of SMS send results
 */
const sendBatchSMS = async (recipients, defaultMessage) => {
  const results = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    details: [],
  };

  // Send SMS with a small delay to avoid rate limiting
  for (const recipient of recipients) {
    const message = recipient.message || defaultMessage;
    
    const result = await sendSMS(recipient.phone, message);
    
    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
    }
    
    results.details.push({
      phone: recipient.phone,
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    });

    // Small delay between SMS (adjust based on your SMS provider's limits)
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
};

/**
 * Verify SMS configuration
 * @returns {Promise<boolean>} - Whether SMS service is properly configured
 */
const verifySMSConfig = async () => {
  try {
    // Check if Twilio credentials are set
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.warn('SMS service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in environment variables.');
      console.log('SMS service will run in MOCK mode for testing.');
      return true; // Return true to allow mock mode
    }

    // If using real Twilio, you can verify the client here
    console.log('SMS service is configured');
    return true;
  } catch (error) {
    console.error('SMS service configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendSMS,
  sendBatchSMS,
  verifySMSConfig,
};
