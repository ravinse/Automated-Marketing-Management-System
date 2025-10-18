/**
 * Professional Email Templates for Marketing Campaigns
 * These templates provide attractive, responsive HTML email designs
 */

/**
 * Wraps content in a professional email template
 * @param {string} content - The main email content
 * @param {object} options - Template options
 * @returns {string} - Complete HTML email
 */
const wrapInTemplate = (content, options = {}) => {
  const {
    title = '🎯 Special Message for You',
    headerColor = 'linear-gradient(135deg, #00AF96 0%, #00D9B5 100%)',
    showCTA = true,
    ctaText = 'Explore Now',
    ctaUrl = 'http://localhost:5174',
    companyName = 'Marketing Management System'
  } = options;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${title}</title>
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
            h1 {
              font-size: 24px !important;
            }
            h2 {
              font-size: 20px !important;
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
                  <td style="background: ${headerColor}; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                      ${title}
                    </h1>
                  </td>
                </tr>
                
                <!-- Content Section -->
                <tr>
                  <td class="content-wrapper" style="padding: 40px 30px; color: #333333; font-size: 16px; line-height: 1.8;">
                    <div style="text-align: left;">
                      ${content}
                    </div>
                    
                    ${showCTA ? `
                    <!-- CTA Button Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td align="center" style="border-radius: 6px; background: linear-gradient(135deg, #00AF96 0%, #00D9B5 100%); box-shadow: 0 4px 15px rgba(0, 175, 150, 0.3);">
                                <a href="${ctaUrl}" target="_blank" 
                                   class="cta-button"
                                   style="font-size: 16px; 
                                          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                                          color: #ffffff; 
                                          text-decoration: none; 
                                          padding: 16px 50px; 
                                          display: inline-block; 
                                          font-weight: 600;
                                          letter-spacing: 0.5px;
                                          text-transform: uppercase;">
                                  ${ctaText}
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
                    ` : ''}
                  </td>
                </tr>
                
                <!-- Footer Section -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                      Thank you for being a valued customer! 💙
                    </p>
                    <p style="margin: 0; color: #adb5bd; font-size: 12px; line-height: 1.5;">
                      © ${new Date().getFullYear()} ${companyName}. All rights reserved.
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
};

/**
 * Promotional email template for sales and discounts
 */
const getPromotionalTemplate = (content, options = {}) => {
  const {
    discount = '20%',
    ctaUrl = 'http://localhost:5174'
  } = options;

  const promotionalContent = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); 
                  color: white; 
                  padding: 20px; 
                  border-radius: 8px; 
                  display: inline-block;
                  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);">
        <h2 style="margin: 0; font-size: 36px; font-weight: 700;">
          ${discount} OFF
        </h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">LIMITED TIME OFFER</p>
      </div>
    </div>
    
    ${content}
    
    <div style="background-color: #fff9e6; 
                border-left: 4px solid #ffd93d; 
                padding: 15px 20px; 
                margin: 25px 0; 
                border-radius: 4px;">
      <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
        ⏰ <strong>Hurry!</strong> This exclusive offer expires soon. Don't miss out on these amazing savings!
      </p>
    </div>
  `;

  return wrapInTemplate(promotionalContent, {
    title: '🎉 Exclusive Offer Just for You!',
    headerColor: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
    ctaText: '🛍️ Shop Now',
    ctaUrl,
    ...options
  });
};

/**
 * Newsletter email template
 */
const getNewsletterTemplate = (content, options = {}) => {
  const newsletterContent = `
    <div style="border-bottom: 3px solid #00AF96; padding-bottom: 20px; margin-bottom: 30px;">
      <p style="margin: 0; color: #00AF96; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
        Newsletter
      </p>
      <h2 style="margin: 10px 0 0 0; color: #333; font-size: 24px; font-weight: 700;">
        Latest Updates & News
      </h2>
    </div>
    
    ${content}
    
    <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
      <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">📬 Stay Connected</h3>
      <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
        Follow us on social media for daily updates, exclusive offers, and more!
      </p>
    </div>
  `;

  return wrapInTemplate(newsletterContent, {
    title: '📰 Your Monthly Newsletter',
    headerColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    ctaText: '📖 Read More',
    ...options
  });
};

/**
 * Product announcement template
 */
const getProductAnnouncementTemplate = (content, options = {}) => {
  const productContent = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                  color: white; 
                  padding: 15px 30px; 
                  border-radius: 25px; 
                  display: inline-block;">
        <p style="margin: 0; font-size: 14px; font-weight: 600; letter-spacing: 1px;">
          ✨ NEW ARRIVAL ✨
        </p>
      </div>
    </div>
    
    ${content}
    
    <div style="background: linear-gradient(135deg, #e0f7fa 0%, #e1bee7 100%); 
                padding: 25px; 
                border-radius: 8px; 
                margin: 25px 0;
                text-align: center;">
      <h3 style="margin: 0 0 10px 0; color: #333; font-size: 20px;">
        🎁 Be the First to Get It!
      </h3>
      <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.6;">
        Join thousands of happy customers who love our products.
      </p>
    </div>
  `;

  return wrapInTemplate(productContent, {
    title: '🚀 Introducing Our Latest Product',
    headerColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    ctaText: '🎯 Discover Now',
    ...options
  });
};

/**
 * Event invitation template
 */
const getEventInvitationTemplate = (content, options = {}) => {
  const {
    eventDate = 'Coming Soon',
    eventLocation = 'Virtual Event'
  } = options;

  const eventContent = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 30px; 
                border-radius: 8px; 
                text-align: center;
                margin-bottom: 30px;">
      <h2 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 700;">
        📅 ${eventDate}
      </h2>
      <p style="margin: 0; font-size: 16px; opacity: 0.95;">
        📍 ${eventLocation}
      </p>
    </div>
    
    ${content}
    
    <div style="border: 2px dashed #00AF96; 
                padding: 20px; 
                border-radius: 8px; 
                margin: 25px 0;
                text-align: center;">
      <p style="margin: 0; color: #00AF96; font-size: 14px; font-weight: 600;">
        🎟️ Limited Seats Available - Reserve Yours Now!
      </p>
    </div>
  `;

  return wrapInTemplate(eventContent, {
    title: '🎊 You\'re Invited!',
    headerColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    ctaText: '🎫 Register Now',
    ...options
  });
};

/**
 * Format content with common text enhancements
 */
const formatContent = (text) => {
  // Add proper spacing and formatting to plain text
  return text
    .split('\n\n')
    .map(paragraph => `<p style="margin: 0 0 15px 0; line-height: 1.8;">${paragraph.trim()}</p>`)
    .join('');
};

/**
 * Create a feature highlight section
 */
const createFeatureSection = (features) => {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
      ${features.map((feature, index) => `
        <tr>
          <td style="padding: 15px 0; border-bottom: 1px solid #e9ecef;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="width: 40px; vertical-align: top;">
                  <div style="width: 32px; 
                              height: 32px; 
                              background: linear-gradient(135deg, #00AF96 0%, #00D9B5 100%); 
                              border-radius: 50%; 
                              display: flex; 
                              align-items: center; 
                              justify-content: center;
                              color: white;
                              font-weight: bold;">
                    ${feature.icon || (index + 1)}
                  </div>
                </td>
                <td style="padding-left: 15px;">
                  <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px; font-weight: 600;">
                    ${feature.title}
                  </h4>
                  <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                    ${feature.description}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `).join('')}
    </table>
  `;
};

module.exports = {
  wrapInTemplate,
  getPromotionalTemplate,
  getNewsletterTemplate,
  getProductAnnouncementTemplate,
  getEventInvitationTemplate,
  formatContent,
  createFeatureSection
};
