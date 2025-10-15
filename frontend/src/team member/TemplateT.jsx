import React, { useState, useEffect } from 'react'
import { Button } from "@material-tailwind/react";
import {Link, useNavigate} from 'react-router-dom'
import Navbart from './Navbart';

// API Configuration
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const Templete = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch templates from database
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/templates`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const data = await response.json();
      setTemplates(data.templates || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId) => {
    // Navigate to campaign creation page with template ID
    navigate(`/createcampaingt?templateId=${templateId}`);
  };

  const handleEditTemplate = async (templateId) => {
    // Navigate to campaign creation page with template ID in edit mode
    navigate(`/createcampaingt?templateId=${templateId}&editMode=true`);
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const response = await fetch(`${API_URL}/templates/${templateId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete template');
      
      // Refresh templates list
      fetchTemplates();
      alert('Template deleted successfully!');
    } catch (err) {
      console.error('Error deleting template:', err);
      alert('Failed to delete template');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbart />
      
      {/* Container with responsive padding */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-32 py-6 sm:py-8 lg:py-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              Campaign Templates
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Saved templates you can reuse for new campaigns
            </p>
          </div>
          <Link to="/createcampaingt?createTemplate=true">
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors font-medium shadow-sm w-full sm:w-auto">
              Add New Template
            </button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-10 sm:py-16">
            <p className="text-gray-600">Loading templates...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        {/* Templates Table */}
        {!loading && !error && (
          <div className="relative bg-white shadow-md rounded-lg overflow-hidden">
            {templates.length === 0 ? (
              <div className="p-6 sm:p-10 text-center">
                <p className="text-gray-600 mb-4 text-sm sm:text-base">No templates saved yet</p>
                <p className="text-gray-500 text-xs sm:text-sm">Click "Add New Template" above to create your first template</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left table-auto min-w-max">
                  <thead>
                    <tr>
                      <th className="p-3 sm:p-4 border-b border-slate-300 bg-slate-50">
                        <p className="block text-xs sm:text-sm font-normal leading-none text-slate-500">
                          Template Name
                        </p>
                      </th>
                      <th className="p-3 sm:p-4 border-b border-slate-300 bg-slate-50 hidden md:table-cell">
                        <p className="block text-xs sm:text-sm font-normal leading-none text-slate-500">
                          Description
                        </p>
                      </th>
                      <th className="p-3 sm:p-4 border-b border-slate-300 bg-slate-50 hidden lg:table-cell">
                        <p className="block text-xs sm:text-sm font-normal leading-none text-slate-500">
                          Target Segments
                        </p>
                      </th>
                      <th className="p-3 sm:p-4 border-b border-slate-300 bg-slate-50 hidden xl:table-cell">
                        <p className="block text-xs sm:text-sm font-normal leading-none text-slate-500">
                          Usage Count
                        </p>
                      </th>
                      <th className="p-3 sm:p-4 border-b border-slate-300 bg-slate-50">
                        <p className="block text-xs sm:text-sm font-normal leading-none text-slate-500">
                          Actions
                        </p>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((template) => (
                      <tr key={template._id} className="hover:bg-slate-50">
                        <td className="p-3 sm:p-4 border-b border-slate-200">
                          <p className="block text-xs sm:text-sm font-semibold text-slate-800">
                            {template.name}
                          </p>
                          {/* Show description on mobile below name */}
                          <p className="block md:hidden text-xs text-slate-600 mt-1">
                            {template.description ? 
                              (template.description.length > 30 
                                ? template.description.substring(0, 30) + '...' 
                                : template.description)
                              : 'No description'}
                          </p>
                        </td>
                        <td className="p-3 sm:p-4 border-b border-slate-200 hidden md:table-cell">
                          <p className="block text-xs sm:text-sm text-slate-600">
                            {template.description ? 
                              (template.description.length > 50 
                                ? template.description.substring(0, 50) + '...' 
                                : template.description)
                              : 'No description'}
                          </p>
                        </td>
                        <td className="p-3 sm:p-4 border-b border-slate-200 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {template.customerSegments && template.customerSegments.length > 0 ? (
                              template.customerSegments.slice(0, 2).map((segment, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {segment}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs sm:text-sm text-gray-500">No segments</span>
                            )}
                            {template.customerSegments && template.customerSegments.length > 2 && (
                              <span className="text-xs text-gray-500">+{template.customerSegments.length - 2} more</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 border-b border-slate-200 hidden xl:table-cell">
                          <p className="block text-xs sm:text-sm text-slate-800">
                            {template.usageCount || 0} times
                          </p>
                        </td>
                        <td className="p-3 sm:p-4 border-b border-slate-200">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button 
                              onClick={() => handleUseTemplate(template._id)}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-600 text-white text-xs sm:text-sm font-normal hover:bg-blue-700 transition whitespace-nowrap"
                            >
                              Use
                            </button>
                            <button 
                              onClick={() => handleEditTemplate(template._id)}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-green-100 text-green-800 text-xs sm:text-sm font-normal hover:bg-green-200 transition whitespace-nowrap"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteTemplate(template._id)}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-100 text-red-800 text-xs sm:text-sm font-normal hover:bg-red-200 transition whitespace-nowrap"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Templete;
