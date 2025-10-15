import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@material-tailwind/react";

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const PendingApproval = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pending campaigns on component mount
  useEffect(() => {
    fetchPendingCampaigns();
  }, []);

  const fetchPendingCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/campaigns?status=pending_approval`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      
      const data = await response.json();
      // API returns 'items' not 'campaigns'
      setCampaigns(data.items || []);
      console.log('Pending campaigns:', data.items);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load pending campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (campaignId) => {
    if (!window.confirm('Are you sure you want to approve this campaign?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/campaigns/approve/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) throw new Error('Failed to approve campaign');
      
      alert('Campaign approved successfully!');
      // Refresh the list
      fetchPendingCampaigns();
    } catch (error) {
      console.error('Error approving campaign:', error);
      alert('Failed to approve campaign. Please try again.');
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
        <p className="text-gray-600">Loading pending campaigns...</p>
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
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          Pending Approval ({campaigns.length})
        </h3>
      </div>
      <div className="relative flex flex-col h-full text-gray-700 bg-white shadow-md rounded-lg bg-clip-border overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No campaigns pending approval</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto min-w-max">
            <thead>
              <tr>
                <th className="p-4 border-b border-slate-300 bg-slate-50">
                  <p className="block text-sm font-bold leading-none text-slate-500">
                    Campaign Name
                  </p>
                </th>
                <th className="p-4 border-b border-slate-300 bg-slate-50">
                  <p className="block text-sm font-bold leading-none text-slate-500">
                    Target Segment
                  </p>
                </th>
                <th className="p-4 border-b border-slate-300 bg-slate-50">
                  <p className="block text-sm font-bold leading-none text-slate-500">
                    Schedule
                  </p>
                </th>
                <th className="p-4 border-b border-slate-300 bg-slate-50">
                  <p className="block text-sm font-bold leading-none text-slate-500">
                    Submitted
                  </p>
                </th>
                <th className="p-4 border-b border-slate-300 bg-slate-50">
                  <p className="block text-sm font-bold leading-none text-slate-500">
                    Action
                  </p>
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign._id} className="hover:bg-slate-50">
                  <td className="p-4 border-b border-slate-200">
                    <p className="block text-sm text-slate-800 font-medium">
                      {campaign.title}
                    </p>
                    <p className="block text-xs text-slate-500">
                      {campaign.description ? campaign.description.substring(0, 50) + '...' : ''}
                    </p>
                  </td>
                  <td className="p-4 border-b border-slate-200">
                    <p className="block text-sm text-slate-800">
                      {campaign.customerSegments && campaign.customerSegments.length > 0
                        ? campaign.customerSegments.join(', ')
                        : 'All Customers'}
                    </p>
                  </td>
                  <td className="p-4 border-b border-slate-200">
                    <p className="block text-sm text-slate-800">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </p>
                  </td>
                  <td className="p-4 border-b border-slate-200">
                    <p className="block text-sm text-slate-600">
                      {formatDate(campaign.submittedAt)}
                    </p>
                  </td>
                  <td className="flex gap-4 p-4 border-b border-slate-200">
                    <button 
                      onClick={() => handleApprove(campaign._id)}
                      className="px-5 py-2 rounded-full bg-green-100 text-green-800 font-normal hover:bg-green-200 transition"
                    >
                      Approve
                    </button>
                    <Link 
                      to={`/campaignreview?campaignId=${campaign._id}`}
                      className="px-5 py-2 rounded-full bg-gray-100 text-gray-800 font-normal hover:bg-gray-200 transition inline-block text-center"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApproval;
