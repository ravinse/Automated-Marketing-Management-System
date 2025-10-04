const Template = require("../models/Template");

// Get all templates
const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find()
      .sort({ usageCount: -1, createdAt: -1 }); // Sort by most used first
    
    res.status(200).json({
      success: true,
      count: templates.length,
      templates
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get single template by ID
const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ 
        success: false,
        message: "Template not found" 
      });
    }
    
    // Increment usage count
    template.usageCount += 1;
    await template.save();
    
    res.status(200).json({
      success: true,
      template
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Create new template
const createTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      emailSubject,
      emailContent,
      smsContent,
      selectedFilters,
      customerSegments,
      attachments,
      createdBy
    } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Template name is required" 
      });
    }

    // Create new template
    const template = new Template({
      name: name.trim(),
      description,
      emailSubject,
      emailContent,
      smsContent,
      selectedFilters: selectedFilters || [],
      customerSegments: customerSegments || [],
      attachments: attachments || [],
      createdBy: createdBy || 'current-user'
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: "Template created successfully",
      template
    });
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update template
const updateTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ 
        success: false,
        message: "Template not found" 
      });
    }

    // Update fields
    const allowedUpdates = [
      'name', 'description', 'emailSubject', 'emailContent', 
      'smsContent', 'selectedFilters', 'customerSegments', 'attachments'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        template[field] = req.body[field];
      }
    });

    await template.save();

    res.status(200).json({
      success: true,
      message: "Template updated successfully",
      template
    });
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Delete template
const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    
    if (!template) {
      return res.status(404).json({ 
        success: false,
        message: "Template not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Template deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
};
