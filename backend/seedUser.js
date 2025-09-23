const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Connection Error:", err));

async function createUser(name, username, email, password, role) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      username,   // ✅ required
      email,
      password: hashedPassword,
      role        // ✅ must be one of ["admin", "manager", "owner", "team member"]
    });

    await user.save();
    console.log(`✅ User created: ${name} (${role})`);
  } catch (err) {
    console.error("❌ Error creating user:", err.message);
  }
}

async function seedUsers() {
  await createUser("Admin User", "adminUser", "admin@example.com", "admin123", "admin");
  await createUser("Manager User", "managerUser", "manager@example.com", "manager123", "manager");
  await createUser("Owner User", "ownerUser", "owner@example.com", "owner123", "owner");
  await createUser("Team Member", "teamUser", "team@example.com", "team123", "team member");
  await createUser("Lakshan", "lakshan", "lakshan.lr2001@gmail.com", "lakshan123", "admin");
  await createUser("LakshanR", "lakshanr", "lakshan.bc2@gmail.com", "lakshan1234", "manager");
  mongoose.connection.close();
}

seedUsers();
