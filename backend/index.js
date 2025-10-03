const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173" })); // frontend port
app.use(express.json());

// Connect to DB
connectDB();

// Routes
const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
const userRoutes = require("./routes/users");

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

// Start server
app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});