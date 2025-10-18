import React, { useState, useEffect } from 'react';
import API from '../../api';

const Campaign = () => {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLatestCampaign();
  }, []);

  const fetchLatestCampaign = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/campaigns', {
        params: { page: 1, limit: 1, sortBy: 'createdAt', sortOrder: 'desc' }
      });
      
      if (response.data.items && response.data.items.length > 0) {
        const latestCampaign = response.data.items[0];
        setCampaign(latestCampaign);
      }
    } catch (err) {
      console.error('Error fetching campaign:', err);
      // Set null campaign instead of showing error
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Approval' },
      approved: { color: 'bg-blue-100 text-blue-800', label: 'Approved' },
      running: { color: 'bg-green-100 text-green-800', label: 'Active' },
      completed: { color: 'bg-purple-100 text-purple-800', label: 'Completed' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading campaign data...</div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="bg-white px-8 py-8">
        <h1 className="text-3xl font-bold text-black mb-2">Welcome to Campaign Manager</h1>
        <p className="text-sm text-gray-500 mb-8">No campaigns created yet</p>
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500">Create your first campaign to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white px-8 py-8">
      {/* Campaign Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-black">
          {campaign.title || 'Untitled Campaign'}
        </h1>
        {getStatusBadge(campaign.status)}
      </div>
      
      {/* Campaign ID */}
      <p className="text-sm text-gray-500 mb-8">
        Campaign ID: {campaign._id?.slice(-8).toUpperCase() || 'N/A'}
      </p>
      
      {/* Overview Section */}
      <div>
        <h2 className="text-xl font-bold text-black mb-8">Overview</h2>
        
        {/* Overview Grid */}
        <div className="grid grid-cols-12 gap-x-8 gap-y-8">
          {/* First Row with borders */}
          <div className="col-span-3 border-t border-gray-200 pt-2">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-base text-black mt-2 capitalize">{campaign.status?.replace('_', ' ')}</p>
          </div>
          
          <div className="col-span-9 border-t border-gray-200 pt-2">
            <p className="text-sm text-gray-500">Target Segment</p>
            <p className="text-base text-black mt-2">
              {campaign.customerSegments && campaign.customerSegments.length > 0 
                ? campaign.customerSegments.join(', ') 
                : 'All Customers'}
            </p>
          </div>
          
          {/* Second Row with borders */}
          <div className="col-span-3 border-t border-gray-200 pt-2">
            <p className="text-sm text-gray-500">Schedule</p>
            <p className="text-base text-black mt-2">
              {campaign.startDate && campaign.endDate 
                ? `${formatDate(campaign.startDate)} - ${formatDate(campaign.endDate)}`
                : 'Not scheduled'}
            </p>
          </div>
          
          <div className="col-span-9 border-t border-gray-200 pt-2">
            <p className="text-sm text-gray-500">Content Type</p>
            <p className="text-base text-black mt-2">
              {campaign.channels && campaign.channels.length > 0 
                ? campaign.channels.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' & ')
                : 'Email'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-black mb-8">Content</h2>
        
        {/* Content Grid aligned with Overview */}
        <div className="grid grid-cols-12 gap-x-8 gap-y-8">
          {/* Subject */}
          <div className="col-span-3 border-t border-gray-200 pt-2">
            <p className="text-sm text-gray-500">Subject</p>
            <p className="text-base text-black mt-2">
              {campaign.emailSubject || 'No subject'}
            </p>
          </div>
          
          {/* Email Body aligned with Target Segment and Content Type */}
          <div className="col-span-9 border-t border-gray-200 pt-2">
            <p className="text-sm text-gray-500">Email Body</p>
            <p className="text-base text-black mt-2">
              {campaign.emailContent || campaign.description || 'No content'}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics (if available) */}
      {campaign.performanceMetrics && campaign.status === 'completed' && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-black mb-8">Performance</h2>
          <div className="grid grid-cols-12 gap-x-8 gap-y-8">
            <div className="col-span-3 border-t border-gray-200 pt-2">
              <p className="text-sm text-gray-500">Sent</p>
              <p className="text-base text-black mt-2">{campaign.performanceMetrics.sent || 0}</p>
            </div>
            <div className="col-span-3 border-t border-gray-200 pt-2">
              <p className="text-sm text-gray-500">Opened</p>
              <p className="text-base text-black mt-2">{campaign.performanceMetrics.opened || 0}</p>
            </div>
            <div className="col-span-3 border-t border-gray-200 pt-2">
              <p className="text-sm text-gray-500">Clicked</p>
              <p className="text-base text-black mt-2">{campaign.performanceMetrics.clicked || 0}</p>
            </div>
            <div className="col-span-3 border-t border-gray-200 pt-2">
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-base text-black mt-2">
                ${campaign.performanceMetrics.revenue?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaign;