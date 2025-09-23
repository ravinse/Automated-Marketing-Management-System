const express = require("express");
const { authMiddleware, adminOnly } = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateRandomPassword = require("../utils/generatePassword");

const router = express.Router();

// @route POST /api/users
// @desc Admin creates new user
// @access Private (Admin only)
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  const { name, username, email, role } = req.body;

  try {
    // Generate random password
    const tempPassword = generateRandomPassword(10);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    // send tempPassword in response (later via email)
    res.json({
      message: "✅ User created successfully",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      tempPassword,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Server error" });
  }
});

module.exports = router;
