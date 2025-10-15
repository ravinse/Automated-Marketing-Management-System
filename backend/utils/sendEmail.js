const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html, campaignId = null, customerId = null) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Add tracking to HTML if campaignId and customerId are provided
    let trackedHtml = html;
    if (campaignId && customerId) {
      const baseUrl = process.env.BASE_URL || "http://localhost:3000";
      
      // Add tracking pixel for open rate (invisible 1x1 image)
      const trackingPixel = `<img src="${baseUrl}/api/tracking/open/${campaignId}/${customerId}" width="1" height="1" style="display:none;" alt="" />`;
      
      // Replace links with tracking links
      trackedHtml = html.replace(
        /<a\s+href="([^"]+)"/gi,
        (match, url) => {
          const trackingUrl = `${baseUrl}/api/tracking/click/${campaignId}/${customerId}?url=${encodeURIComponent(url)}`;
          return `<a href="${trackingUrl}"`;
        }
      );
      
      // Add tracking pixel at the end of the email
      trackedHtml += trackingPixel;
    }

    const mailOptions = {
      from: `"May Fashion" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: trackedHtml,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to: ${to}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};

module.exports = sendEmail;

