const express = require("express");
const { authMiddleware, adminOnly, validateObjectId } = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateRandomPassword = require("../utils/generatePassword");

const router = express.Router();

// @route GET /api/users
// @desc Get all users (Admin only)
// @access Private (Admin only)
router.get("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Server error" });
  }
});

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
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(409).json({ error: `${field} already exists` });
    }
    res.status(500).json({ error: "❌ Server error" });
  }
});

// @route PUT /api/users/:id
// @desc Update user (Admin only)
// @access Private (Admin only)
router.put("/:id", authMiddleware, adminOnly, validateObjectId(), async (req, res) => {
  const { name, username, email, role } = req.body;
  
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.name = name || user.name;
    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();

    res.json({
      message: "✅ User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error(err);
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(409).json({ error: `${field} already exists` });
    }
    res.status(500).json({ error: "❌ Server error" });
  }
});

// @route DELETE /api/users/:id
// @desc Delete user (Admin only)
// @access Private (Admin only)
router.delete("/:id", authMiddleware, adminOnly, validateObjectId(), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "✅ User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Server error" });
  }
});

module.exports = router;
