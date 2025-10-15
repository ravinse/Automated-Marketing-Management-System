const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const nodeMailer = require("nodemailer");
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Multer storage for avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.user?.id || 'guest'}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('Only images are allowed'));
    cb(null, true);
  }
});

// @route GET /api/auth/profile
// @desc Get current user profile
// @access Private
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      phone: user.phone || '',
      department: user.department || '',
      profileImage: user.profileImage || null
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// @route PUT /api/auth/profile
// @desc Update current user's profile (editable fields only)
// @access Private
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, username, phone, department } = req.body || {};
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Basic validations (optional)
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Apply allowed updates only
    if (typeof name === 'string') user.name = name.trim();
    if (typeof email === 'string') user.email = email.trim();
    if (typeof username === 'string') user.username = username.trim();
    if (typeof phone === 'string') user.phone = phone.trim();
    if (typeof department === 'string') user.department = department.trim();

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        phone: user.phone || '',
        department: user.department || '',
        profileImage: user.profileImage || null,
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    // Handle duplicate key errors for email/username
    if (err && err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(409).json({ error: `${field} already in use` });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route POST /api/auth/profile/avatar
// @desc Upload/update profile image
// @access Private
router.post('/profile/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const relativePath = `/uploads/${req.file.filename}`;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.profileImage = relativePath;
    await user.save();
    res.json({ message: 'Avatar updated', profileImage: relativePath });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("🔍 Login attempt:", { email, password: password ? "[HIDDEN]" : "empty" });

  try {
    // find by email OR username
    const user = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.email }]
    });

    console.log("🔍 User found:", user ? `${user.email} (${user.role})` : "No user found");

    if (!user) {
      console.log("❌ Login failed: User not found");
      return res.status(400).json({ error: "Invalid email/username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Password match:", isMatch ? "Yes" : "No");

    if (!isMatch) {
      console.log("❌ Login failed: Password mismatch");
      return res.status(400).json({ error: "Invalid email/username or password" });
    }

    // issue JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log(`✅ User logged in: ${user.email}, ${user.role}`);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// @route PUT /api/auth/change-password
router.put("/change-password", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email }, { username: email }]
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Old password incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// @route POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  console.log(`🔍 Password reset request for: ${email}`);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`✅ User found: ${user.email}`);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving (for security)
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    console.log(`🔑 Generated reset token: ${resetToken.substring(0, 10)}...`);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();
    console.log(`💾 Reset token saved for user: ${user.email}`);
    // In development, log full tokens to aid debugging (do not enable in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 dev resetToken: ${resetToken}`);
      console.log(`🔐 dev hashedToken: ${hashedToken}`);
    }

  // Reset link: prefer explicit FRONTEND_URL, otherwise derive from request origin/referer (helps dev), final fallback to Vite default 5173
  const frontendBase = (process.env.FRONTEND_URL && process.env.FRONTEND_URL.trim())
    || req.get('origin')
    || req.get('referer')
    || 'http://localhost:5173';
  const chosenBase = String(frontendBase).replace(/\/$/, '');
  const resetLink = `${chosenBase}/reset-password/${resetToken}`;
  console.log(`🔗 Using frontend base for reset link: ${chosenBase}`);

    // Send email (with error handling)
    try {
      console.log(`📧 Attempting to send email to: ${email}`);
      console.log(`📧 Using email credentials: ${process.env.EMAIL_USER}`);
      
      // Prefer explicit SMTP to avoid service auto-detection issues
      const transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
        secure: (process.env.SMTP_SECURE || 'true') === 'true', // true for 465, false for 587
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false,
        },
        debug: true,
        logger: true,
      });

      // Verify connection configuration
      console.log('🔍 Verifying email transporter...');
      await transporter.verify();
      console.log('✅ Email transporter verified successfully');

      const mailOptions = {
        from: `"Marketing Management System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset - Automated Marketing System",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #00AF96; margin: 0;">Marketing Management System</h1>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #00AF96;">
              <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
              <p style="color: #555; line-height: 1.6;">Hello,</p>
              <p style="color: #555; line-height: 1.6;">
                We received a request to reset the password for your account (${email}).
              </p>
              <p style="color: #555; line-height: 1.6;">
                Click the button below to reset your password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #00AF96; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Reset My Password
                </a>
              </div>
              
              <p style="color: #555; line-height: 1.6;">
                <strong>This link will expire in 10 minutes</strong> for security reasons.
              </p>
              
              <p style="color: #555; line-height: 1.6;">
                If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #888; font-size: 12px;">
              <p>This email was sent by Marketing Management System</p>
              <p>If the button doesn't work, copy and paste this link:</p>
              <p style="word-break: break-all;">${resetLink}</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Reset email sent successfully to: ${email}`);

      // In development, include the resetToken in the response so developers can test the flow
      if (process.env.NODE_ENV === 'development') {
        return res.json({
          message: "Password reset link has been sent to your email address. (Development mode: token included)",
          success: true,
          resetToken,
          resetLink
        });
      }

      res.json({ 
        message: "Password reset link has been sent to your email address. Please check your inbox and spam folder.",
        success: true
      });

    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);
      
      // For development - still provide the token
      if (process.env.NODE_ENV === 'development') {
        res.json({ 
          message: "Email service unavailable. Use this token for testing", 
          resetToken,
          resetLink,
          success: false,
          emailError: emailError.message
        });
      } else {
        // In production - don't expose the token
        res.status(500).json({ 
          error: "Failed to send reset email. Please try again later or contact support.",
          success: false
        });
      }
    }
    console.log(`🔑 Reset link sent to ${email}: ${resetLink}`);
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// @route POST /api/auth/changepass
// @desc Change password with old password verification
router.post("/changepass", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  console.log(`🔑 Password change request for: ${email}`);

  try {
    // Validate input
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ No user found with that email");
      return res.status(404).json({ error: "No email found. Please restart the password reset process." });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      console.log("❌ Old password incorrect");
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    console.log(`✅ Password changed successfully for: ${user.email}`);

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// @route POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  console.log(`🔑 Password reset attempt with token: ${token}`);

  try {
    // Hash token again to match DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    console.log(`🔍 Looking for user with hashed token: ${hashedToken.substring(0, 10)}...`);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.log("❌ No user found with valid reset token");

      // Helpful debug: check if token exists but expired (development only)
      if (process.env.NODE_ENV === 'development') {
        const found = await User.findOne({ resetPasswordToken: hashedToken });
        if (found) {
          console.log('🔎 Token found but expired');
          return res.status(400).json({ error: 'Token expired' });
        }
      }

      return res.status(400).json({ error: "Invalid or expired token" });
    }

    console.log(`✅ Found user: ${user.email}`);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    console.log(`✅ Password reset successful for: ${user.email}`);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
