const express = require("express");
const router = express.Router();
const {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
} = require("../controllers/templateController");
const { validateObjectId } = require("../middleware/authMiddleware");

// Get all templates
router.get("/", getTemplates);

// Get single template by ID
router.get("/:id", validateObjectId(), getTemplateById);

// Create new template
router.post("/", createTemplate);

// Update template
router.put("/:id", validateObjectId(), updateTemplate);

// Delete template
router.delete("/:id", validateObjectId(), deleteTemplate);

module.exports = router;
