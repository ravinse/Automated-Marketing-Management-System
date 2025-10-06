import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// API Configuration
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const Running = () => {
  const [runningCampaigns, setRunningCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRunningCampaigns();
  }, []);

  const fetchRunningCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/campaigns?status=running`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      
      const data = await response.json();
      setRunningCampaigns(data.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching running campaigns:', err);
      setError('Failed to load running campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (campaignId) => {
    if (!window.confirm('Are you sure you want to complete this campaign?')) return;
    
    try {
      const response = await fetch(`${API_URL}/campaigns/complete/${campaignId}`, {
        method: 'PATCH',
      });
      
      if (!response.ok) throw new Error('Failed to complete campaign');
      
      alert('Campaign completed successfully!');
      // Refresh the list
      fetchRunningCampaigns();
    } catch (err) {
      console.error('Error completing campaign:', err);
      alert('Failed to complete campaign');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Running Campaigns</h2>
        <p className="text-gray-600 text-center py-8">Loading campaigns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Running Campaigns</h2>
        <p className="text-red-600 text-center py-8">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Running Campaigns ({runningCampaigns.length})</h2>
      
      {runningCampaigns.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No campaigns currently running</p>
          <p className="text-gray-500 text-sm">Campaigns will appear here once approved by the marketing manager</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Campaign Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Target Segments</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Start Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">End Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {runningCampaigns.map((campaign, index) => (
                <tr key={campaign._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{campaign.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {campaign.description ? (campaign.description.length > 50 ? campaign.description.substring(0, 50) + '...' : campaign.description) : 'No description'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {campaign.customerSegments && campaign.customerSegments.length > 0 
                      ? campaign.customerSegments.slice(0, 2).join(', ') + (campaign.customerSegments.length > 2 ? '...' : '')
                      : 'All customers'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(campaign.startDate)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(campaign.endDate)}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Running
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm space-x-2">
                    <Link to={`/campaingreviewt?campaignId=${campaign._id}`}>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        View Details
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleComplete(campaign._id)}
                      className="text-green-600 hover:text-green-800 font-medium ml-2"
                    >
                      Complete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Running;