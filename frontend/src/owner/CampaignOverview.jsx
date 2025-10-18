import React, { useState, useEffect } from 'react';
import OwnerNavbar from './homepage/OwnerNavbar';
import API from '../api';

const CampaignOverview = () => {
  const [campaignData, setCampaignData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaignId) {
      fetchCampaignDetails(selectedCampaignId);
    } else {
      fetchCampaignOverview();
    }
  }, [selectedCampaignId]);

  const fetchCampaigns = async () => {
    try {
      // Fetch campaigns that have been executed (have performance metrics)
      const response = await API.get('/campaigns', {
        params: { limit: 100 }
      });
      
      // Filter to only show campaigns that have been executed (have sent > 0)
      const executedCampaigns = (response.data.items || []).filter(campaign => {
        const metrics = campaign.performanceMetrics || {};
        return metrics.sent > 0; // Only campaigns that have been executed
      });
      
      setCampaigns(executedCampaigns);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setCampaigns([]);
    }
  };

  const fetchCampaignDetails = async (campaignId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get(`/campaigns/${campaignId}`);
      const campaign = response.data;
      
      // Transform campaign data to match the overview format
      const metrics = campaign.performanceMetrics || {};
      const sent = metrics.sent || 0;
      
      setCampaignData({
        _id: campaign._id,
        name: campaign.title,
        targetAudience: campaign.customerSegments?.join(', ') || 'All Customers',
        content: campaign.description || campaign.emailContent || 'N/A',
        openRate: sent > 0 ? ((metrics.opened || 0) / sent * 100).toFixed(0) : '-',
        openRateDelta: '-',
        clickThroughRate: sent > 0 ? ((metrics.clicked || 0) / sent * 100).toFixed(0) : '-',
        clickThroughRateDelta: '-',
        conversionRate: sent > 0 ? ((metrics.conversions || 0) / sent * 100).toFixed(0) : '-',
        conversionRateDelta: '-',
        audienceEngagement: sent > 0 ? (((metrics.opened || 0) + (metrics.clicked || 0)) / (sent * 2) * 100).toFixed(0) : '-',
        audienceEngagementDelta: '-',
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate
      });
    } catch (err) {
      console.error('Error fetching campaign details:', err);
      setCampaignData({
        name: 'Campaign Not Found',
        targetAudience: '-',
        content: 'Unable to load campaign details',
        openRate: '-',
        openRateDelta: '-',
        clickThroughRate: '-',
        clickThroughRateDelta: '-',
        conversionRate: '-',
        conversionRateDelta: '-',
        audienceEngagement: '-',
        audienceEngagementDelta: '-'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/campaigns/overview-metrics');
      setCampaignData(response.data);
    } catch (err) {
      console.error('Error fetching campaign overview:', err);
      // Set default values instead of showing error
      setCampaignData({
        name: 'No Campaign',
        targetAudience: '-',
        content: 'No campaigns available',
        openRate: '-',
        openRateDelta: '-',
        clickThroughRate: '-',
        clickThroughRateDelta: '-',
        conversionRate: '-',
        conversionRateDelta: '-',
        audienceEngagement: '-',
        audienceEngagementDelta: '-'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-blue-100 text-blue-800', label: 'Approved' },
      running: { color: 'bg-green-100 text-green-800', label: 'Running' },
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
      <div className="min-h-screen bg-gray-50">
        <OwnerNavbar />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading campaign overview...</div>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    { title: 'Open Rate', value: campaignData.openRate === '-' ? '-' : `${campaignData.openRate}%`, delta: campaignData.openRateDelta },
    { title: 'Click-Through Rate', value: campaignData.clickThroughRate === '-' ? '-' : `${campaignData.clickThroughRate}%`, delta: campaignData.clickThroughRateDelta },
    { title: 'Conversion Rate', value: campaignData.conversionRate === '-' ? '-' : `${campaignData.conversionRate}%`, delta: campaignData.conversionRateDelta },
    { title: 'Audience Engagement', value: campaignData.audienceEngagement === '-' ? '-' : `${campaignData.audienceEngagement}%`, delta: campaignData.audienceEngagementDelta }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <OwnerNavbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Performance Overview</h1>
        <p className="text-gray-600 mb-6">Analyze the effectiveness of your campaigns with detailed metrics and insights.</p>

        {/* Campaign Selection Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Viewing Campaign</div>
                <div className="text-lg font-semibold text-gray-900">
                  {campaignData?.name || 'Select an executed campaign'}
                </div>
              </div>
            </div>
            {campaigns.length > 0 ? (
              <select
                className="px-6 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium text-gray-700 min-w-[300px] cursor-pointer hover:border-blue-400 transition-colors"
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
              >
                <option value="">📊 Latest Executed Campaign</option>
                <optgroup label="✅ Completed Campaigns">
                  {campaigns.filter(c => c.status === 'completed').map((campaign) => (
                    <option key={campaign._id} value={campaign._id}>
                      {campaign.title} - {formatDate(campaign.createdAt)}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🟢 Running Campaigns">
                  {campaigns.filter(c => c.status === 'running').map((campaign) => (
                    <option key={campaign._id} value={campaign._id}>
                      {campaign.title} - {formatDate(campaign.createdAt)}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="📝 Other Executed Campaigns">
                  {campaigns.filter(c => c.status !== 'running' && c.status !== 'completed').map((campaign) => (
                    <option key={campaign._id} value={campaign._id}>
                      {campaign.title} - {formatDate(campaign.createdAt)}
                    </option>
                  ))}
                </optgroup>
              </select>
            ) : (
              <div className="text-gray-400 text-sm">No executed campaigns available</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-900 font-semibold">Campaign Details</div>
              {campaignData?.status && getStatusBadge(campaignData.status)}
            </div>
            <div className="text-sm text-gray-600">Campaign Name</div>
            <div className="text-gray-900 font-medium mb-4">{campaignData?.name || '-'}</div>
            {campaignData?.startDate && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Start Date</div>
                    <div className="text-gray-900 text-sm">{formatDate(campaignData.startDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">End Date</div>
                    <div className="text-gray-900 text-sm">{formatDate(campaignData.endDate)}</div>
                  </div>
                </div>
              </>
            )}
            <div className="text-sm text-gray-600">Content</div>
            <div className="text-gray-900 line-clamp-3">{campaignData?.content || '-'}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-sm text-gray-600">Target Audience</div>
            <div className="text-gray-900 font-medium mb-4">{campaignData?.targetAudience || '-'}</div>
            <div className="text-sm text-gray-600">Key Metrics</div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {metrics.map((metric, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="text-gray-600 text-sm">{metric.title}</div>
                  <div className="text-xl font-semibold text-gray-900">{metric.value}</div>
                  <div className={`text-sm ${metric.delta === '-' || metric.delta.startsWith('-') ? 'text-gray-400' : 'text-green-600'}`}>
                    {metric.delta === '-' ? '-' : `${metric.delta}%`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['Open Rate Trend', 'Click-Through Rate Trend'].map((title, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-gray-900 font-semibold mb-2">{title}</div>
              <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 text-sm">
                Trend chart placeholder
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CampaignOverview;
