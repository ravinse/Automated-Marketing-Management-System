import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// API Configuration
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const Finished = () => {
  const [finishedCampaigns, setFinishedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFinishedCampaigns();
  }, []);

  const fetchFinishedCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/campaigns?status=completed`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      
      const data = await response.json();
      setFinishedCampaigns(data.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching finished campaigns:', err);
      setError('Failed to load finished campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      const response = await fetch(`${API_URL}/campaigns/${campaignId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete campaign');
      
      alert('Campaign deleted successfully!');
      // Refresh the list
      fetchFinishedCampaigns();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      alert('Failed to delete campaign');
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Finished Campaigns</h2>
        <p className="text-gray-600 text-center py-8">Loading campaigns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Finished Campaigns</h2>
        <p className="text-red-600 text-center py-8">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Finished Campaigns ({finishedCampaigns.length})</h2>
      
      {finishedCampaigns.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No finished campaigns yet</p>
          <p className="text-gray-500 text-sm">Campaigns will appear here after completion</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Campaign Name</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Description</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Target Segments</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Created</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Completed</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {finishedCampaigns.map((campaign, index) => (
                <tr key={campaign._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{campaign.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {campaign.description 
                      ? (campaign.description.length > 50 
                        ? campaign.description.substring(0, 50) + '...' 
                        : campaign.description)
                      : 'No description'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {campaign.customerSegments && campaign.customerSegments.length > 0
                      ? campaign.customerSegments.slice(0, 2).join(', ') + 
                        (campaign.customerSegments.length > 2 ? '...' : '')
                      : 'All customers'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(campaign.createdAt)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(campaign.completedAt)}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Completed
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm space-x-2">
                    <Link to={`/campaingreviewt?campaignId=${campaign._id}`}>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        View Details
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(campaign._id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
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

export default Finished;