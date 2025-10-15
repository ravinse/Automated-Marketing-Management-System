import React, { useState, useEffect } from 'react'
import { Button } from "@material-tailwind/react";
import {Link, useNavigate} from 'react-router-dom'
import Navbarm from './Navbarm';

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
    navigate(`/createcampaingm?templateId=${templateId}`);
  };

  const handleEditTemplate = async (templateId) => {
    // Navigate to campaign creation page with template ID in edit mode
    navigate(`/createcampaingm?templateId=${templateId}&editMode=true`);
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
    <div>
        <div><Navbarm /></div>
       
       {/* Page Container with responsive padding */}
       <div className="min-h-screen bg-gray-50">
         {/* Header Section */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             <div>
               <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Campaign Templates</h1>
               <p className="text-gray-600 mt-1">Saved templates you can reuse for new campaigns</p>
             </div>
             <Link to="/createcampaingm?createTemplate=true">
               <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition-colors font-medium shadow-sm w-full sm:w-auto">
                 Add New Template
               </button>
             </Link>
           </div>
         </div>

         {/* Content Section */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
           {/* Loading State */}
           {loading && (
             <div className="bg-white rounded-lg shadow-md p-10 text-center">
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
             <div className="relative flex flex-col h-full text-gray-700 bg-white shadow-md rounded-lg bg-clip-border overflow-hidden">
               {templates.length === 0 ? (
                 <div className="p-10 text-center">
                   <p className="text-gray-600 mb-4">No templates saved yet</p>
                   <p className="text-gray-500 text-sm">Click "Add New Template" above to create your first template</p>
                 </div>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full text-left table-auto min-w-max">
    <thead>
        <tr>
            <th className="p-4 border-b border-slate-300 bg-slate-50">
                <p className="block text-sm font-bold leading-none text-slate-500">
                    Template Name
                </p>
            </th>
            <th className="p-4 border-b border-slate-300 bg-slate-50">
                <p className="block text-sm font-bold leading-none text-slate-500">
                    Description
                </p>
            </th>
            <th className="p-4 border-b border-slate-300 bg-slate-50">
                <p className="block text-sm font-bold leading-none text-slate-500">
                    Target Segments
                </p>
            </th>
            <th className="p-4 border-b border-slate-300 bg-slate-50">
                <p className="block text-sm font-bold leading-none text-slate-500">
                    Usage Count
                </p>
            </th>
            <th className="p-4 border-b border-slate-300 bg-slate-50">
                <p className="block text-sm font-bold leading-none text-slate-500">
                    Actions
                </p>
            </th>
        </tr>
    </thead>
    <tbody>
        {templates.map((template) => (
        <tr key={template._id} className="hover:bg-slate-50">
            <td className="p-4 border-b border-slate-200">
                <p className="block text-sm font-semibold text-slate-800">
                    {template.name}
                </p>
            </td>
            <td className="p-4 border-b border-slate-200">
                <p className="block text-sm text-slate-600">
                    {template.description ? 
                      (template.description.length > 50 
                        ? template.description.substring(0, 50) + '...' 
                        : template.description)
                      : 'No description'}
                </p>
            </td>
            <td className="p-4 border-b border-slate-200">
                <div className="flex flex-wrap gap-1">
                  {template.customerSegments && template.customerSegments.length > 0 ? (
                    template.customerSegments.slice(0, 2).map((segment, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {segment}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No segments</span>
                  )}
                  {template.customerSegments && template.customerSegments.length > 2 && (
                    <span className="text-xs text-gray-500">+{template.customerSegments.length - 2} more</span>
                  )}
                </div>
            </td>
            <td className="p-4 border-b border-slate-200">
                <p className="block text-sm text-slate-800">
                    {template.usageCount || 0} times
                </p>
            </td>
            <td className="p-4 border-b border-slate-200">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUseTemplate(template._id)}
                    className="px-4 py-2 rounded-full bg-blue-600 text-white font-normal hover:bg-blue-700 transition"
                  >
                    Use
                  </button>
                  <button 
                    onClick={() => handleEditTemplate(template._id)}
                    className="px-4 py-2 rounded-full bg-green-100 text-green-800 font-normal hover:bg-green-200 transition"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteTemplate(template._id)}
                    className="px-4 py-2 rounded-full bg-red-100 text-red-800 font-normal hover:bg-red-200 transition"
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
    </div>
  )
}

export default Templete;
