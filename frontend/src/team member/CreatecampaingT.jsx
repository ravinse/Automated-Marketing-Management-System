import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbart';

// API Configuration
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

function CampaignCreation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Campaign ID for tracking saved campaign
  const [campaignId, setCampaignId] = useState(null);
  const [currentStep, setCurrentStep] = useState('basic'); // Track current section
  const [autoSaving, setAutoSaving] = useState(false);
  
  // Debug log
  useEffect(() => {
    console.log('CampaignCreation component mounted');
    loadTemplates();
    
    // Check if template ID is in URL
    const params = new URLSearchParams(location.search);
    const templateId = params.get('templateId');
    if (templateId) {
      handleLoadTemplate(templateId);
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
    endDate: '',
    selectedFilters: [],
    customerSegments: [],
    emailSubject: '',
    emailContent: '',
    smsContent: '',
    templateName: '',
    attachments: []
  });

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
      setSuccess('Campaign submitted for approval successfully!');
      
      setTimeout(() => {
        navigate('/thome');
      }, 1500);
    } catch (error) {
      console.error('Error submitting campaign:', error);
      alert('Failed to submit campaign for approval. Please try again.');
    }
  };

  // Save as Draft functionality
  const handleSaveAsDraft = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Campaign title is required');
      return;
    }

    try {
      let currentCampaignId = campaignId;
      
      // Save or update campaign with draft status
      if (!currentCampaignId) {
        // Create new campaign as draft
        const response = await fetch(`${API_URL}/campaigns`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            createdBy: 'current-user',
            status: 'draft'
          })
        });

        if (!response.ok) throw new Error('Failed to save campaign');
        
        const result = await response.json();
        currentCampaignId = result.campaign._id;
        setCampaignId(currentCampaignId);
      } else {
        // Update existing campaign
        const response = await fetch(`${API_URL}/campaigns/autosave/${currentCampaignId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            status: 'draft'
          })
        });

        if (!response.ok) throw new Error('Failed to update campaign');
      }

      setSuccess('Campaign saved as draft successfully!');
      
      setTimeout(() => {
        navigate('/thome');
      }, 1500);
    } catch (error) {
      console.error('Error saving campaign as draft:', error);
      alert('Failed to save campaign as draft. Please try again.');
    }
  };

  // Delete/Clear form functionality
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
      // Reset form to initial state
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
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
      setSuccess('Template saved successfully!');
      
      // Reload templates to show the new one
      await loadTemplates();
      
      // Clear template name field
      setFormData(prev => ({ ...prev, templateName: '' }));
      
      console.log('Template saved:', result.template);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  // Load Template functionality
  const handleLoadTemplate = async (templateId) => {
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
        // Note: Attachments are file names, not actual files
        attachments: []
      }));
      
      setSuccess('Template loaded successfully!');
      console.log('Template loaded:', template);
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Failed to load template. Please try again.');
    }
  };

  console.log('Rendering CampaignCreation, formData:', formData);

  return (
    <div>
      <Navbar />
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Create New Campaign</h1>
          <p className="text-gray-600">
            Define your campaign's core details, target audience, and content to engage your customers effectively.
          </p>
          {campaignId && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Draft saved (ID: {campaignId})
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
        {/* Load Template Section */}
        {templates.length > 0 && (
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
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
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
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
                      setFormData(prev => ({
                        ...prev,
                        customerSegments: [...prev.customerSegments, segment]
                      }));
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
                          setFormData(prev => ({
                            ...prev,
                            customerSegments: prev.customerSegments.filter(s => s !== segment)
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

        {/* Save Template Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Save as Template</h3>
          
          {/* Save Template Section */}
          <div className="flex items-center gap-4">
            <label htmlFor="templateName" className="text-sm font-medium text-gray-700">
              Save as Template
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
            <button
              type="button"
              onClick={handleSaveAsTemplate}
              disabled={!formData.templateName.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save Template
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Templates save your campaign structure and content for reuse
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            Clear Form
          </button>
          
          <button
            type="button"
            onClick={handleSaveAsDraft}
            className="px-4 py-2 text-white bg-gray-600 rounded hover:bg-gray-700 transition-colors"
          >
            Save as Draft
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Submit for Approval
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}

export default CampaignCreation;
