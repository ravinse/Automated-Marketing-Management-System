import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Completed = ({ isViewOnly = false }) => {
  const [completedCampaigns, setCompletedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Completed component mounted, fetching campaigns...');
    fetchCompletedCampaigns();
  }, []);

  const fetchCompletedCampaigns = async () => {
    try {
      setLoading(true);
      console.log('Fetching completed campaigns from API...');
      const response = await axios.get('http://localhost:5001/api/campaigns', {
        params: { status: 'completed' }
      });
      console.log('Completed campaigns response:', response.data);
      
      // Handle paginated response
      const campaigns = response.data.items || response.data;
      console.log('Campaigns array:', campaigns);
      setCompletedCampaigns(campaigns);
      setError(null);
    } catch (err) {
      console.error('Error fetching completed campaigns:', err);
      setError('Failed to load completed campaigns');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleDelete = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5001/api/campaigns/${campaignId}`);
      fetchCompletedCampaigns(); // Refresh the list
    } catch (err) {
      console.error('Error deleting campaign:', err);
      alert('Failed to delete campaign');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-slate-600">Loading completed campaigns...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          Completed ({completedCampaigns.length})
        </h3>
      </div>
      <div className="relative flex flex-col h-full text-gray-700 bg-white shadow-md rounded-lg bg-clip-border overflow-hidden">
        <div className="overflow-hidden">
          <table className="w-full text-left table-auto">
          <thead>
            <tr>
              <th className="p-3 md:p-4 border-b border-slate-300 bg-slate-50">
                <p className="block text-xs md:text-sm font-bold leading-none text-slate-500">
                  Campaign Name
                </p>
              </th>
              <th className="p-3 md:p-4 border-b border-slate-300 bg-slate-50 hidden lg:table-cell">
                <p className="block text-xs md:text-sm font-bold leading-none text-slate-500">
                  Description
                </p>
              </th>
              <th className="p-3 md:p-4 border-b border-slate-300 bg-slate-50 hidden md:table-cell">
                <p className="block text-xs md:text-sm font-bold leading-none text-slate-500">
                  Target Segments
                </p>
              </th>
              <th className="p-3 md:p-4 border-b border-slate-300 bg-slate-50 hidden sm:table-cell">
                <p className="block text-xs md:text-sm font-bold leading-none text-slate-500">
                  Duration
                </p>
              </th>
              <th className="p-3 md:p-4 border-b border-slate-300 bg-slate-50">
                <p className="block text-xs md:text-sm font-bold leading-none text-slate-500">
                  Completed
                </p>
              </th>
              <th className="p-3 md:p-4 border-b border-slate-300 bg-slate-50">
                <p className="block text-xs md:text-sm font-bold leading-none text-slate-500">
                  Actions
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {completedCampaigns.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">
                  No completed campaigns yet
                </td>
              </tr>
            ) : (
              completedCampaigns.map((campaign) => (
                <tr key={campaign._id} className="hover:bg-slate-50">
                  <td className="p-3 md:p-4 border-b border-slate-200">
                    <p className="block text-xs md:text-sm text-slate-800 font-medium break-words">
                      {campaign.title}
                    </p>
                  </td>
                  <td className="p-3 md:p-4 border-b border-slate-200 hidden lg:table-cell">
                    <p className="block text-xs md:text-sm text-slate-600 break-words max-w-xs">
                      {campaign.description || 'No description'}
                    </p>
                  </td>
                  <td className="p-3 md:p-4 border-b border-slate-200 hidden md:table-cell">
                    <p className="block text-xs md:text-sm text-slate-800 break-words">
                      {campaign.customerSegments && campaign.customerSegments.length > 0
                        ? campaign.customerSegments.join(', ')
                        : campaign.targetSegments && campaign.targetSegments.length > 0
                        ? campaign.targetSegments.join(', ')
                        : 'All Customers'}
                    </p>
                  </td>
                  <td className="p-3 md:p-4 border-b border-slate-200 hidden sm:table-cell">
                    <p className="block text-xs md:text-sm text-slate-800 whitespace-nowrap">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </p>
                  </td>
                  <td className="p-3 md:p-4 border-b border-slate-200">
                    <p className="block text-xs md:text-sm text-slate-800 whitespace-nowrap">
                      {formatDate(campaign.completedAt)}
                    </p>
                  </td>
                  <td className="p-3 md:p-4 border-b border-slate-200">
                    <div className="flex gap-2">
                      {!isViewOnly && (
                        <button
                          onClick={() => handleDelete(campaign._id)}
                          className="text-xs md:text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      )}
                      {isViewOnly && (
                        <span className="text-xs md:text-sm text-gray-400">
                          View Only
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default Completed;
