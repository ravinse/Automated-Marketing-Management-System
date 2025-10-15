import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbarm from './Navbarm'
// API Configuration
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

function CampaignCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Campaign ID for tracking saved campaign
  const [campaignId, setCampaignId] = useState(null);
  const [currentStep, setCurrentStep] = useState('basic'); // Track current section
  const [autoSaving, setAutoSaving] = useState(false);
  
  // Template editing states
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateTemplateMode, setIsCreateTemplateMode] = useState(false);
  
  // Debug log
  useEffect(() => {
    console.log('CampaignCreation component mounted');
    loadTemplates();
    
    // Check if template ID is in URL
    const params = new URLSearchParams(location.search);
    const templateId = params.get('templateId');
    const editMode = params.get('editMode') === 'true';
    const createTemplate = params.get('createTemplate') === 'true';
    
    if (templateId) {
      setEditingTemplateId(templateId);
      setIsEditMode(editMode);
      handleLoadTemplate(templateId, editMode);
    }
    
    if (createTemplate) {
      setIsCreateTemplateMode(true);
    }
  }, [location]);
  
  // UI states
  const [success, setSuccess] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Load templates from database
  const loadTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      const response = await fetch(`${API_URL}/templates`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
        console.log('Loaded templates:', data.templates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '00:00:00',
    endDate: '',
    endTime: '23:59:59',
    selectedFilters: [],
    customerSegments: [],
    targetedCustomerIds: [],
    targetedCustomerCount: 0,
    emailSubject: '',
    emailContent: '',
    smsContent: '',
    templateName: '',
    attachments: []
  });

  // Customer preview state
  const [customerPreview, setCustomerPreview] = useState({
    loading: false,
    count: 0,
    breakdown: {},
    customers: []
  });
  const [showCustomerPreview, setShowCustomerPreview] = useState(false);

  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [showSMSPreview, setShowSMSPreview] = useState(false);

  const filterOptions = [
    'Shopping Frequency',
    'Customer Value',
    'Product Preference'
  ];

  const segmentOptions = {
    'Shopping Frequency': ['New Customers', 'Loyal Customers', 'Lapsed Customers', 'Seasonal Customers'],
    'Customer Value': ['High value customers', 'Low value customers'],
    'Product Preference': ['Women', 'Men', 'Kids', 'Family']
  };

  // Fetch customer preview when segments change
  const fetchCustomerPreview = async (segments) => {
    if (!segments || segments.length === 0) {
      setCustomerPreview({
        loading: false,
        count: 0,
        breakdown: {},
        customers: []
      });
      setFormData(prev => ({
        ...prev,
        targetedCustomerIds: [],
        targetedCustomerCount: 0
      }));
      return;
    }

    setCustomerPreview(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`${API_URL}/segmentation/filtered-customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          customerSegments: segments,
          daysPeriod: 14 // Changed from 6 months (180 days) to 14 days
        })
      });

      if (response.ok) {
        const data = await response.json();
        const customerIds = data.customers.map(c => c.customer_id);
        
        setCustomerPreview({
          loading: false,
          count: data.count,
          breakdown: data.breakdown || {},
          customers: data.customers || []
        });

        // Update form with customer IDs
        setFormData(prev => ({
          ...prev,
          targetedCustomerIds: customerIds,
          targetedCustomerCount: data.count
        }));

        console.log(`✅ Found ${data.count} customers matching selected segments (last 14 days)`);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch customer preview:', response.status, errorText);
        alert(`Error: Unable to fetch customers. Status: ${response.status}\n\nPlease ensure:\n1. Backend server is restarted\n2. MongoDB connection is working\n3. Customer segmentation data is uploaded`);
        setCustomerPreview({
          loading: false,
          count: 0,
          breakdown: {},
          customers: []
        });
      }
    } catch (error) {
      console.error('❌ Error fetching customer preview:', error);
      alert(`Network Error: ${error.message}\n\nPlease check:\n1. Backend server is running on port 5001\n2. API endpoint is accessible\n3. CORS is configured correctly`);
      setCustomerPreview({
        loading: false,
        count: 0,
        breakdown: {},
        customers: []
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachments') {
      setFormData(prevState => ({
        ...prevState,
        attachments: [...prevState.attachments, ...Array.from(files)]
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
    // Auto-save disabled
    // triggerAutoSave();
  };

  // Auto-save function
  const autoSaveCampaign = async (data) => {
    try {
      setAutoSaving(true);
      const url = campaignId 
        ? `${API_URL}/campaigns/autosave/${campaignId}`
        : `${API_URL}/campaigns`;
      
      const method = campaignId ? 'PATCH' : 'POST';
      
      const payload = {
        ...data,
        createdBy: 'current-user', // Replace with actual user from auth
        currentStep: currentStep,
        status: 'draft'
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to save campaign');
      
      const result = await response.json();
      
      // Set campaign ID if it's a new campaign
      if (!campaignId && result.campaign._id) {
        setCampaignId(result.campaign._id);
        console.log('Campaign created with ID:', result.campaign._id);
      }
      
      console.log('Campaign auto-saved successfully');
      setAutoSaving(false);
    } catch (error) {
      console.error('Error auto-saving campaign:', error);
      setAutoSaving(false);
    }
  };

  // Debounce auto-save
  let autoSaveTimeout;
  const triggerAutoSave = () => {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      autoSaveCampaign(formData);
    }, 2000); // Save 2 seconds after user stops typing
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files) {
      setFormData(prevState => ({
        ...prevState,
        attachments: [...prevState.attachments, ...Array.from(files)]
      }));
    }
  };

  const removeAttachment = (index) => {
    setFormData(prevState => ({
      ...prevState,
      attachments: prevState.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      setFormData(prevState => ({
        ...prevState,
        attachments: [...prevState.attachments, ...Array.from(files)]
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSubmitForApproval();
  };

  // Submit for Approval functionality
  const handleSubmitForApproval = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Campaign title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Campaign description is required');
      return;
    }

    if (!formData.startDate) {
      alert('Campaign start date is required');
      return;
    }

    if (!formData.endDate) {
      alert('Campaign end date is required');
      return;
    }

    // Validate that end date is after start date
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      alert('End date must be after start date');
      return;
    }

    try {
      let currentCampaignId = campaignId;
      
      // First, ensure campaign is saved with all current data (including dates)
      if (!currentCampaignId) {
        // Save campaign first and get the ID
        const saveResponse = await fetch(`${API_URL}/campaigns`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            createdBy: 'current-user',
            currentStep: currentStep,
            status: 'draft'
          })
        });

        if (!saveResponse.ok) throw new Error('Failed to save campaign');
        
        const saveResult = await saveResponse.json();
        currentCampaignId = saveResult.campaign._id;
        setCampaignId(currentCampaignId);
      } else {
        // Update existing campaign with all current data (including dates)
        const updateResponse = await fetch(`${API_URL}/campaigns/autosave/${currentCampaignId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            currentStep: currentStep
          })
        });

        if (!updateResponse.ok) throw new Error('Failed to update campaign');
        console.log('Campaign data updated before submission');
      }

      if (!currentCampaignId) {
        alert('Failed to save campaign. Please try again.');
        return;
      }

      // Submit for approval
      const response = await fetch(`${API_URL}/campaigns/submit/${currentCampaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) throw new Error('Failed to submit campaign');

      const result = await response.json();
      setSuccess('Sent for approval');
      
      setTimeout(() => {
        navigate('/Campaign');
      }, 2000);
    } catch (error) {
      console.error('Error submitting campaign:', error);
      alert('Failed to submit campaign for approval. Please try again.');
    }
  };

  // Save as Draft functionality
  const handleSaveAsDraft = () => {
    setSuccess('Campaign saved as draft successfully!');
    setTimeout(() => {
      navigate('/campaigns');
    }, 2000);
  };

  // Delete/Clear form functionality
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
      // Reset form to initial state
      setFormData({
        title: '',
        description: '',
        startDate: '',
        startTime: '00:00:00',
        endDate: '',
        endTime: '23:59:59',
        selectedFilters: [],
        customerSegments: [],
        emailSubject: '',
        emailContent: '',
        smsContent: '',
        templateName: '',
        attachments: []
      });
      setSuccess('Form cleared successfully');
    }
  };

  // Save as Template functionality
  const handleSaveAsTemplate = async () => {
    if (!formData.templateName.trim()) {
      alert('Template name is required');
      return;
    }

    try {
      const templateData = {
        name: formData.templateName,
        description: formData.description,
        emailSubject: formData.emailSubject,
        emailContent: formData.emailContent,
        smsContent: formData.smsContent,
        selectedFilters: formData.selectedFilters,
        customerSegments: formData.customerSegments,
        attachments: formData.attachments.map(file => file.name || file),
        createdBy: 'current-user' // Replace with actual user from auth
      };

      const response = await fetch(`${API_URL}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) throw new Error('Failed to save template');

      const result = await response.json();
      console.log('Template saved:', result.template);
      
      // Show success message
      alert('Template saved successfully!');
      
      // If in create template mode, redirect to templates page
      if (isCreateTemplateMode) {
        navigate('/Template');
      } else {
        // Otherwise, reload templates and clear template name field
        await loadTemplates();
        setFormData(prev => ({ ...prev, templateName: '' }));
        setSuccess('Template saved successfully!');
      }
      
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  // Load Template functionality
  const handleLoadTemplate = async (templateId, editMode = false) => {
    if (!templateId) return;
    
    try {
      const response = await fetch(`${API_URL}/templates/${templateId}`);
      if (!response.ok) throw new Error('Failed to load template');
      
      const data = await response.json();
      const template = data.template;
      
      // Load template data into form
      setFormData(prev => ({
        ...prev,
        description: template.description || '',
        emailSubject: template.emailSubject || '',
        emailContent: template.emailContent || '',
        smsContent: template.smsContent || '',
        selectedFilters: template.selectedFilters || [],
        customerSegments: template.customerSegments || [],
        templateName: editMode ? template.name : '', // Load template name only in edit mode
        // Note: Attachments are file names, not actual files
        attachments: []
      }));
      
      if (editMode) {
        setSuccess('Template loaded for editing. Make your changes and click "Update Template".');
      } else {
        setSuccess('Template loaded successfully!');
      }
      console.log('Template loaded:', template);
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load template. Please try again.');
    }
  };

  // Update existing template
  const handleUpdateTemplate = async () => {
    if (!editingTemplateId) {
      alert('No template to update');
      return;
    }

    if (!formData.templateName.trim()) {
      alert('Template name is required');
      return;
    }

    try {
      const templateData = {
        name: formData.templateName,
        description: formData.description,
        emailSubject: formData.emailSubject,
        emailContent: formData.emailContent,
        smsContent: formData.smsContent,
        selectedFilters: formData.selectedFilters,
        customerSegments: formData.customerSegments,
        attachments: formData.attachments.map(file => file.name || file)
      };

      const response = await fetch(`${API_URL}/templates/${editingTemplateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) throw new Error('Failed to update template');

      const result = await response.json();
      console.log('Template updated:', result.template);
      
      // Show success message and redirect
      alert('Template updated successfully!');
      
      // Navigate back to templates page
      navigate('/Template');
      
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template. Please try again.');
    }
  };

  console.log('Rendering CampaignCreation, formData:', formData);

  return (
    <div> <Navbarm/>
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Template' : isCreateTemplateMode ? 'Create New Template' : 'Create New Campaign'}
          </h1>
          <p className="text-gray-600">
            {isEditMode 
              ? 'Update your template content and settings.'
              : isCreateTemplateMode
              ? 'Design a reusable template for future campaigns. Fill in the details below and save as a template.'
              : 'Define your campaign\'s core details, target audience, and content to engage your customers effectively.'}
          </p>
          {campaignId && !isEditMode && !isCreateTemplateMode && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Draft saved (ID: {campaignId})
            </p>
          )}
          {isEditMode && editingTemplateId && (
            <p className="text-sm text-blue-600 mt-1">
              ✏️ Editing template (ID: {editingTemplateId})
            </p>
          )}
          {isCreateTemplateMode && (
            <p className="text-sm text-blue-600 mt-1">
              📝 Template creation mode
            </p>
          )}
        </div>
        {autoSaving && (
          <div className="flex items-center text-blue-600">
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm">Saving...</span>
          </div>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-medium">Success!</p>
          <p className="text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Load Template Section - Hidden in Edit Mode */}
        {templates.length > 0 && !isEditMode && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Load from Template</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a template to load
              </label>
              <div className="flex gap-2">
                <select
                  className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => e.target.value && handleLoadTemplate(e.target.value)}
                  defaultValue=""
                >
                  <option value="">Select a template...</option>
                  {templates.map(template => (
                    <option key={template._id} value={template._id}>
                      {template.name} {template.usageCount > 0 ? `(Used ${template.usageCount}x)` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Found {templates.length} saved template{templates.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {isLoadingTemplates && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-600">Loading templates...</p>
          </div>
        )}

        {/* Campaign Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter campaign title"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Targeting Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Targeting
            {autoSaving && <span className="text-sm text-blue-600 ml-2">(Saving...)</span>}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date and Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  onFocus={() => {
                    if (currentStep === 'basic') {
                      setCurrentStep('targeting');
                      // Auto-save disabled
                      // autoSaveCampaign(formData);
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  step="1"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* End Date and Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  min={formData.startDate}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  step="1"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filters</label>
              <div className="relative">
                <select
                  id="filters"
                  name="filters"
                  onChange={(e) => {
                    const filter = e.target.value;
                    if (filter && !formData.selectedFilters.includes(filter)) {
                      setFormData(prev => ({
                        ...prev,
                        selectedFilters: [...prev.selectedFilters, filter],
                        // Clear customer segments when filters change
                        customerSegments: []
                      }));
                    }
                    // Reset the select value
                    e.target.value = "";
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select filters</option>
                  {filterOptions.map(filter => (
                    !formData.selectedFilters.includes(filter) && (
                      <option key={filter} value={filter}>
                        {filter}
                      </option>
                    )
                  ))}
                </select>
                
                {/* Selected Filters Display */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.selectedFilters.map((filter) => (
                    <div 
                      key={filter}
                      className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                    >
                      {filter}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            selectedFilters: prev.selectedFilters.filter(f => f !== filter),
                            // Clear customer segments when removing a filter
                            customerSegments: []
                          }));
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="customerSegment" className="block text-sm font-medium text-gray-700 mb-1">Customer Segments</label>
              <div className="relative">
                <select
                  id="customerSegment"
                  name="customerSegment"
                  onChange={(e) => {
                    const segment = e.target.value;
                    if (segment && !formData.customerSegments.includes(segment)) {
                      const newSegments = [...formData.customerSegments, segment];
                      setFormData(prev => ({
                        ...prev,
                        customerSegments: newSegments
                      }));
                      // Fetch customer preview with new segments
                      fetchCustomerPreview(newSegments);
                    }
                    // Reset the select value
                    e.target.value = "";
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={!formData.selectedFilters?.length}
                >
                  <option value="">Select segments</option>
                  {formData.selectedFilters?.map(filter => (
                    segmentOptions[filter]?.map(segment => (
                      !formData.customerSegments.includes(segment) && (
                        <option key={`${filter}-${segment}`} value={segment}>
                          {segment} ({filter})
                        </option>
                      )
                    ))
                  ))}
                </select>
                
                {/* Selected Segments Display */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.customerSegments.map((segment, index) => (
                    <div 
                      key={segment}
                      className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                    >
                      {segment}
                      <button
                        type="button"
                        onClick={() => {
                          const newSegments = formData.customerSegments.filter(s => s !== segment);
                          setFormData(prev => ({
                            ...prev,
                            customerSegments: newSegments
                          }));
                          // Fetch customer preview with updated segments
                          fetchCustomerPreview(newSegments);
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Customer Preview */}
                {formData.customerSegments.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-900">Targeted Customers</h4>
                      {customerPreview.loading && (
                        <span className="text-sm text-blue-600">Loading...</span>
                      )}
                    </div>
                    {!customerPreview.loading && (
                      <>
                        <p className="text-2xl font-bold text-blue-700 mb-2">
                          {customerPreview.count.toLocaleString()} customers
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          This campaign will target {customerPreview.count} customers matching your selected segments.
                        </p>
                        {customerPreview.count > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowCustomerPreview(true)}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            View customer list
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            Content
            {autoSaving && <span className="text-sm text-blue-600 ml-2">(Saving...)</span>}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                id="emailSubject"
                name="emailSubject"
                value={formData.emailSubject}
                onChange={handleChange}
                onFocus={() => {
                  if (currentStep === 'targeting') {
                    setCurrentStep('content');
                    // Auto-save disabled
                    // autoSaveCampaign(formData);
                  }
                }}
                placeholder="Enter email subject"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label htmlFor="emailContent" className="block text-sm font-medium text-gray-700 mb-1">Email Content</label>
              <textarea
                id="emailContent"
                name="emailContent"
                value={formData.emailContent}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label htmlFor="smsContent" className="block text-sm font-medium text-gray-700 mb-1">SMS Content</label>
              <textarea
                id="smsContent"
                name="smsContent"
                value={formData.smsContent}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (Optional)</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <p className="text-gray-600 mb-2">Drag and drop files here or browse</p>
                <p className="text-sm text-gray-500">Supported formats: PDF, DOCX, JPG, PNG. Max file size: 10MB</p>
                <input
                  type="file"
                  id="fileInput"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                />
                <button 
                  type="button" 
                  className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  Browse Files
                </button>
              </div>
              {formData.attachments.length > 0 && (
                <div className="mt-3">
                  <ul className="space-y-2">
                    {formData.attachments.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button 
                type="button" 
                onClick={() => setShowEmailPreview(true)}
                className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded shadow-sm"
              >
                Preview Email
              </button>
              <button 
                type="button" 
                onClick={() => setShowSMSPreview(true)}
                className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded shadow-sm"
              >
                Preview SMS
              </button>
            </div>
          </div>
        </div>

        {/* Email Preview Modal */}
        {showEmailPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Email Preview</h3>
                  <button
                    onClick={() => setShowEmailPreview(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Subject:</p>
                    <p className="font-medium">{formData.emailSubject}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Content:</p>
                    <div className="whitespace-pre-wrap">{formData.emailContent}</div>
                  </div>
                  {formData.attachments.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Attachments:</p>
                      <ul className="space-y-1">
                        {formData.attachments.map((file, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                            </svg>
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SMS Preview Modal */}
        {showSMSPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">SMS Preview</h3>
                  <button
                    onClick={() => setShowSMSPreview(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-gray-800 whitespace-pre-wrap">{formData.smsContent}</p>
                    {formData.attachments.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600 mb-1">Attachments:</p>
                        <ul className="space-y-1">
                          {formData.attachments.map((file, index) => (
                            <li key={index} className="text-sm text-blue-600">
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer List Preview Modal */}
        {showCustomerPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Targeted Customer List</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {customerPreview.count} customers matching your selected segments
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCustomerPreview(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Selected Segments:</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.customerSegments.map(segment => (
                      <span key={segment} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {segment}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Shopping Frequency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Spending Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customerPreview.customers.slice(0, 100).map((customer, index) => (
                        <tr key={customer.customer_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {customer.customer_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {customer.segmentation.purchase_frequency}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {customer.segmentation.spending}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {customer.segmentation.category}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {customerPreview.customers.length > 100 && (
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Showing first 100 of {customerPreview.count} customers
                  </p>
                )}
              </div>
              <div className="p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowCustomerPreview(false)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Template Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {isEditMode ? 'Template Details' : 'Save as Template'}
          </h3>
          
          {/* Save Template Section */}
          <div className="flex items-center gap-4">
            <label htmlFor="templateName" className="text-sm font-medium text-gray-700">
              {isEditMode ? 'Template Name' : 'Save as Template'}
            </label>
            <input
              type="text"
              id="templateName"
              name="templateName"
              value={formData.templateName}
              onChange={handleChange}
              placeholder="Enter Template Name"
              className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isEditMode ? (
              <button
                type="button"
                onClick={handleUpdateTemplate}
                disabled={!formData.templateName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Update Template
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAsTemplate}
                disabled={!formData.templateName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Template
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {isEditMode 
              ? 'Update this template to save your changes'
              : 'Templates save your campaign structure and content for reuse'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          {isEditMode ? (
            <>
              <button
                type="button"
                onClick={() => navigate('/Template')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateTemplate}
                disabled={!formData.templateName.trim()}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Update Template
              </button>
            </>
          ) : isCreateTemplateMode ? (
            <>
              <button
                type="button"
                onClick={() => navigate('/Template')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAsTemplate}
                disabled={!formData.templateName.trim()}
                className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Template
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Clear Form
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </>
          )}
        </div>
      </form>
    </div>
    </div>
  );
}

export default CampaignCreation;
