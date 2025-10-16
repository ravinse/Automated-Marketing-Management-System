import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const Approved = ({ isViewOnly = false }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch approved campaigns on component mount
  useEffect(() => {
    fetchApprovedCampaigns();
  }, []);

  const fetchApprovedCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/campaigns?status=approved`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      
      const data = await response.json();
      setCampaigns(data.items || []);
      console.log('Approved campaigns:', data.items);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load approved campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to start executing this campaign?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/campaigns/execute/${campaignId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to execute campaign');
      }
      
      alert('Campaign execution started successfully!');
      // Refresh the list
      fetchApprovedCampaigns();
    } catch (error) {
      console.error('Error executing campaign:', error);
      alert(`Failed to execute campaign: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (campaign) => {
    const now = new Date();
    const startDate = campaign.startDate ? new Date(campaign.startDate) : null;
    
    if (!startDate) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Ready</span>;
    }
    
    if (startDate > now) {
      return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Scheduled</span>;
    }
    
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Ready to Start</span>;
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Loading approved campaigns...</p>
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
          Approved Campaigns ({campaigns.length})
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Campaigns approved and ready for execution
        </p>
      </div>
      <div className="relative flex flex-col h-full text-gray-700 bg-white shadow-md rounded-lg bg-clip-border overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No approved campaigns</h3>
            <p className="mt-1 text-sm text-gray-500">
              Campaigns will appear here once they are approved
            </p>
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
                      Target Count
                    </p>
                  </th>
                  <th className="p-4 border-b border-slate-300 bg-slate-50">
                    <p className="block text-sm font-bold leading-none text-slate-500">
                      Schedule
                    </p>
                  </th>
                  <th className="p-4 border-b border-slate-300 bg-slate-50">
                    <p className="block text-sm font-bold leading-none text-slate-500">
                      Approved On
                    </p>
                  </th>
                  <th className="p-4 border-b border-slate-300 bg-slate-50">
                    <p className="block text-sm font-bold leading-none text-slate-500">
                      Status
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
                  <tr key={campaign._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 border-b border-slate-200">
                      <p className="block text-sm text-slate-800 font-medium">
                        {campaign.title}
                      </p>
                      <p className="block text-xs text-slate-500 mt-1">
                        {campaign.description ? campaign.description.substring(0, 50) + (campaign.description.length > 50 ? '...' : '') : ''}
                      </p>
                    </td>
                    <td className="p-4 border-b border-slate-200">
                      <div className="flex flex-wrap gap-1">
                        {campaign.customerSegments && campaign.customerSegments.length > 0 ? (
                          campaign.customerSegments.slice(0, 2).map((segment, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {segment}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-600">All Customers</span>
                        )}
                        {campaign.customerSegments && campaign.customerSegments.length > 2 && (
                          <span className="text-xs text-slate-500">+{campaign.customerSegments.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 border-b border-slate-200">
                      <p className="block text-sm text-slate-800 font-medium">
                        {campaign.targetedCustomerCount || 0}
                      </p>
                      <p className="block text-xs text-slate-500">customers</p>
                    </td>
                    <td className="p-4 border-b border-slate-200">
                      <p className="block text-sm text-slate-800">
                        {formatDate(campaign.startDate)}
                      </p>
                      <p className="block text-xs text-slate-500">
                        to {formatDate(campaign.endDate)}
                      </p>
                    </td>
                    <td className="p-4 border-b border-slate-200">
                      <p className="block text-sm text-slate-600">
                        {formatDate(campaign.approvedAt)}
                      </p>
                    </td>
                    <td className="p-4 border-b border-slate-200">
                      {getStatusBadge(campaign)}
                    </td>
                    <td className="p-4 border-b border-slate-200">
                      <div className="flex gap-2">
                        {!isViewOnly && (
                          <button 
                            onClick={() => handleStartCampaign(campaign._id)}
                            className="px-4 py-2 rounded-full bg-[#00af96] text-white font-normal hover:bg-[#009580] transition-colors text-sm"
                          >
                            Execute
                          </button>
                        )}
                        <Link 
                          to={`/campaignreview?campaignId=${campaign._id}`}
                          className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 font-normal hover:bg-gray-200 transition-colors inline-block text-center text-sm"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Info section */}
      {campaigns.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">About Approved Campaigns</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  These campaigns have been approved and are ready for execution. Click "Execute" to send emails/SMS to targeted customers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approved;
