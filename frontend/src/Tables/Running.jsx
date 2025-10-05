import React, { useState, useEffect } from 'react';
import { Button } from "@material-tailwind/react";

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const Running = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch running campaigns on component mount
  useEffect(() => {
    fetchRunningCampaigns();
  }, []);

  const fetchRunningCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/campaigns?status=running`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      
      const data = await response.json();
      setCampaigns(data.items || []);
      console.log('Running campaigns:', data.items);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load running campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (campaignId) => {
    if (!window.confirm('Are you sure you want to complete this campaign?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/campaigns/complete/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) throw new Error('Failed to complete campaign');
      
      alert('Campaign completed successfully!');
      // Refresh the list
      fetchRunningCampaigns();
    } catch (error) {
      console.error('Error completing campaign:', error);
      alert('Failed to complete campaign. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Loading running campaigns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="w-full">
        <h3 className="text-lg font-semibold ml-52 text-slate-800">
          Running Campaigns ({campaigns.length})
        </h3>
      </div>
      <div className="relative flex flex-col h-full text-gray-700 bg-white shadow-md rounded-lg bg-clip-border mx-56 mt-10">
        {campaigns.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No campaigns currently running</p>
            <p className="text-gray-500 text-sm mt-2">Campaigns will appear here once approved</p>
          </div>
        ) : (
          <table className="w-full text-left table-auto min-w-max">
            <thead>
              <tr>
                <th className="p-4 border-b border-slate-300 bg-slate-50">
                  <p className="block text-sm font-normal leading-none text-slate-500">
                    Campaign Name
                  </p>
                </th>
                <th className="p-4 border-b border-slate-300 bg-slate-50">
                  <p className="block text-sm font-normal leading-none text-slate-500">
                    Description
                  </p>
                </th>
                <th className="p-4 border-b border-slate-300 bg-slate-50">
                  <p className="block text-sm font-normal leading-none text-slate-500">
                    Target Segment
                  </p>
                </th>
                <th className="p-4 border-b border-slate-300 bg-slate-50">
                  <p className="block text-sm font-normal leading-none text-slate-500">
                    Start Date
                  </p>
                </th>
                <th className="p-4 border-b border-slate-300 bg-slate-50">
                  <p className="block text-sm font-normal leading-none text-slate-500">
                    End Date
                  </p>
                </th>
                <th className="p-4 border-b border-slate-300 bg-slate-50">
                  <p className="block text-sm font-normal leading-none text-slate-500">
                    Status
                  </p>
                </th>
                <th className="p-4 border-b border-slate-300 bg-slate-50">
                  <p className="block text-sm font-normal leading-none text-slate-500">
                    Actions
                  </p>
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, index) => (
                <tr key={campaign._id} className="hover:bg-slate-50">
                  <td className="p-4 border-b border-slate-200">
                    <p className="block text-sm text-slate-800 font-medium">
                      {campaign.title}
                    </p>
                  </td>
                  <td className="p-4 border-b border-slate-200">
                    <p className="block text-sm text-slate-600">
                      {campaign.description 
                        ? (campaign.description.length > 40 
                          ? campaign.description.substring(0, 40) + '...' 
                          : campaign.description)
                        : 'No description'}
                    </p>
                  </td>
                  <td className="p-4 border-b border-slate-200">
                    <p className="block text-sm text-slate-800">
                      {campaign.customerSegments && campaign.customerSegments.length > 0
                        ? campaign.customerSegments.slice(0, 2).join(', ') + 
                          (campaign.customerSegments.length > 2 ? '...' : '')
                        : 'All Customers'}
                    </p>
                  </td>
                  <td className="p-4 border-b border-slate-200">
                    <p className="block text-sm text-slate-800">
                      {formatDate(campaign.startDate)}
                    </p>
                  </td>
                  <td className="p-4 border-b border-slate-200">
                    <p className="block text-sm text-slate-800">
                      {formatDate(campaign.endDate)}
                    </p>
                  </td>
                  <td className="p-4 border-b border-slate-200">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Running
                    </span>
                  </td>
                  <td className="p-4 border-b border-slate-200">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleComplete(campaign._id)}
                        className="text-green-600 hover:text-green-800 font-medium text-sm"
                      >
                        Complete
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Running;
