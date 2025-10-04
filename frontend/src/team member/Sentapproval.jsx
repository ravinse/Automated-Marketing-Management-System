import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// API Configuration
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const SentForApproval = () => {
  const [sentForApprovalCampaigns, setSentForApprovalCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSentForApprovalCampaigns();
  }, []);

  const fetchSentForApprovalCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/campaigns`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      
      const data = await response.json();
      // Filter campaigns with status 'pending_approval'
      const pendingCampaigns = (data.campaigns || data.items || []).filter(
        campaign => campaign.status === 'pending_approval'
      );
      setSentForApprovalCampaigns(pendingCampaigns);
      setError(null);
    } catch (err) {
      console.error('Error fetching sent for approval campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (campaignId) => {
    if (!window.confirm('Are you sure you want to withdraw this submission?')) return;
    
    try {
      const response = await fetch(`${API_URL}/campaigns/${campaignId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete campaign');
      
      // Refresh the list
      fetchSentForApprovalCampaigns();
      alert('Campaign submission withdrawn successfully!');
    } catch (err) {
      console.error('Error deleting campaign:', err);
      alert('Failed to withdraw submission');
    }
  };

  if (loading) {
    return (
      <div className="bg-white px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sent for Approval</h2>
        <p className="text-gray-600 text-center py-8">Loading campaigns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sent for Approval</h2>
        <p className="text-red-600 text-center py-8">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Sent for Approval ({sentForApprovalCampaigns.length})</h2>
      
      {sentForApprovalCampaigns.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No campaigns sent for approval yet</p>
          <Link to="/createcampaingt">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Create Campaign
            </button>
          </Link>
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Campaign Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Description</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Target Segments</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Created</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Submitted</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sentForApprovalCampaigns.map((campaign, index) => (
              <tr key={campaign._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                  {campaign.title || 'Untitled Campaign'}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {campaign.description ? 
                    (campaign.description.length > 50 
                      ? campaign.description.substring(0, 50) + '...' 
                      : campaign.description)
                    : 'No description'}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {campaign.customerSegments && campaign.customerSegments.length > 0
                    ? campaign.customerSegments.slice(0, 2).join(', ') + 
                      (campaign.customerSegments.length > 2 ? '...' : '')
                    : 'None'}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {campaign.createdAt 
                    ? new Date(campaign.createdAt).toLocaleDateString()
                    : 'N/A'}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {campaign.submittedAt 
                    ? new Date(campaign.submittedAt).toLocaleDateString()
                    : campaign.updatedAt 
                      ? new Date(campaign.updatedAt).toLocaleDateString()
                      : 'N/A'}
                </td>
                <td className="py-3 px-4 text-sm">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                    Pending Approval
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">
                  <div className="flex gap-2">
                    <Link to={`/campaignreview?campaignId=${campaign._id}`}>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        View Details
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(campaign._id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Withdraw
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
  );
};

export default SentForApproval;