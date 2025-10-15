const nodemailer = require("nodemailer");
require("dotenv").config();

async function testEmail() {
  console.log("🔍 Testing email configuration...");
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_SECURE:", process.env.SMTP_SECURE);
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: (process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: true,
      logger: true,
    });

    console.log("\n🔍 Verifying transporter...");
    await transporter.verify();
    console.log("✅ Transporter verified successfully!\n");

    console.log("📧 Sending test email...");
    const info = await transporter.sendMail({
      from: `"Marketing System Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: "Test Email - Marketing System",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #00AF96;">Email Configuration Test</h2>
          <p>This is a test email from your Marketing Management System.</p>
          <p>If you're receiving this, your email configuration is working correctly! ✅</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Email test failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

testEmail();
