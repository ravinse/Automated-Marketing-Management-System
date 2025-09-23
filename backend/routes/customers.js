const express = require("express");
const router = express.Router();
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const { authMiddleware } = require("../middleware/authMiddleware");

// CRUD routes
router.post("/", authMiddleware, createCustomer);       // Add customer
router.get("/", authMiddleware, getCustomers);          // Get all customers
router.get("/:id", authMiddleware, getCustomerById);    // Get single customer
router.put("/:id", authMiddleware, updateCustomer);     // Update customer
router.delete("/:id", authMiddleware, deleteCustomer);  // Delete customer

module.exports = router;
