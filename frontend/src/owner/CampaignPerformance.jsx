import React, { useState, useEffect } from 'react';
import OwnerNavbar from './homepage/OwnerNavbar';

const CampaignPerformance = () => {
  const [overallMetrics, setOverallMetrics] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalConversions: 0,
    totalRevenue: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    avgConversionRate: 0
  });
  const [completedCampaigns, setCompletedCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overall performance
      const overallResponse = await fetch('http://localhost:5000/api/campaigns/performance/overall');
      if (!overallResponse.ok) throw new Error('Failed to fetch overall performance');
      const overallData = await overallResponse.json();
      setOverallMetrics(overallData);

      // Fetch completed campaigns
      const completedResponse = await fetch('http://localhost:5000/api/campaigns/performance/completed');
      if (!completedResponse.ok) throw new Error('Failed to fetch completed campaigns');
      const completedData = await completedResponse.json();
      setCompletedCampaigns(completedData);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OwnerNavbar />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading performance data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OwnerNavbar />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OwnerNavbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Performance</h1>
        <p className="text-gray-600 mb-6">Track the performance of your campaigns and optimize for better results.</p>

        {/* Overall Performance Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-gray-500 text-sm mb-1">Total Campaigns</div>
              <div className="text-3xl font-bold text-gray-900">{overallMetrics.totalCampaigns}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-gray-500 text-sm mb-1">Active Campaigns</div>
              <div className="text-3xl font-bold text-green-600">{overallMetrics.activeCampaigns}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-gray-500 text-sm mb-1">Completed Campaigns</div>
              <div className="text-3xl font-bold text-blue-600">{overallMetrics.completedCampaigns}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-gray-500 text-sm mb-1">Total Revenue</div>
              <div className="text-3xl font-bold text-purple-600">{formatCurrency(overallMetrics.totalRevenue)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm">
              <div className="text-blue-700 text-sm mb-1">Total Sent</div>
              <div className="text-2xl font-bold text-blue-900">{formatNumber(overallMetrics.totalSent)}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm">
              <div className="text-green-700 text-sm mb-1">Average Open Rate</div>
              <div className="text-2xl font-bold text-green-900">{overallMetrics.avgOpenRate}%</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm">
              <div className="text-purple-700 text-sm mb-1">Average Click Rate</div>
              <div className="text-2xl font-bold text-purple-900">{overallMetrics.avgClickRate}%</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-sm">
              <div className="text-orange-700 text-sm mb-1">Total Conversions</div>
              <div className="text-2xl font-bold text-orange-900">{formatNumber(overallMetrics.totalConversions)}</div>
            </div>
          </div>
        </div>

        {/* Campaign Selection and Details */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Completed Campaigns</h2>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCampaign?._id || ''}
              onChange={(e) => {
                const campaign = completedCampaigns.find(c => c._id === e.target.value);
                setSelectedCampaign(campaign);
              }}
            >
              <option value="">Select a campaign to view details</option>
              {completedCampaigns.map((campaign) => (
                <option key={campaign._id} value={campaign._id}>
                  {campaign.title} - {formatDate(campaign.completedAt)}
                </option>
              ))}
            </select>
          </div>

          {selectedCampaign ? (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedCampaign.title}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-gray-500 text-sm">Start Date</div>
                  <div className="text-gray-900 font-medium">{formatDate(selectedCampaign.startDate)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">End Date</div>
                  <div className="text-gray-900 font-medium">{formatDate(selectedCampaign.endDate)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Completed</div>
                  <div className="text-gray-900 font-medium">{formatDate(selectedCampaign.completedAt)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Status</div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-blue-700 text-sm">Sent</div>
                  <div className="text-2xl font-bold text-blue-900">{formatNumber(selectedCampaign.sent)}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-green-700 text-sm">Opened</div>
                  <div className="text-2xl font-bold text-green-900">{formatNumber(selectedCampaign.opened)}</div>
                  <div className="text-green-600 text-xs mt-1">{selectedCampaign.openRate}%</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-purple-700 text-sm">Clicked</div>
                  <div className="text-2xl font-bold text-purple-900">{formatNumber(selectedCampaign.clicked)}</div>
                  <div className="text-purple-600 text-xs mt-1">{selectedCampaign.clickRate}%</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-orange-700 text-sm">Conversions</div>
                  <div className="text-2xl font-bold text-orange-900">{formatNumber(selectedCampaign.conversions)}</div>
                  <div className="text-orange-600 text-xs mt-1">{selectedCampaign.conversionRate}%</div>
                </div>
              </div>

              {selectedCampaign.revenue > 0 && (
                <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <div className="text-purple-700 text-sm">Revenue Generated</div>
                  <div className="text-3xl font-bold text-purple-900">{formatCurrency(selectedCampaign.revenue)}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500">Select a completed campaign from the dropdown above to view its performance details</p>
            </div>
          )}
        </div>

        {/* All Completed Campaigns Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Completed Campaigns</h3>
          </div>
          {completedCampaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-sm font-medium">Campaign Name</th>
                    <th className="px-6 py-3 text-sm font-medium">Completed Date</th>
                    <th className="px-6 py-3 text-sm font-medium text-right">Sent</th>
                    <th className="px-6 py-3 text-sm font-medium text-right">Open Rate</th>
                    <th className="px-6 py-3 text-sm font-medium text-right">Click Rate</th>
                    <th className="px-6 py-3 text-sm font-medium text-right">Conversions</th>
                    <th className="px-6 py-3 text-sm font-medium text-right">Revenue</th>
                    <th className="px-6 py-3 text-sm font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {completedCampaigns.map((campaign) => (
                    <tr key={campaign._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{campaign.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(campaign.completedAt)}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 text-right">{formatNumber(campaign.sent)}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 text-right">{campaign.openRate}%</td>
                      <td className="px-6 py-4 text-sm text-gray-800 text-right">{campaign.clickRate}%</td>
                      <td className="px-6 py-4 text-sm text-gray-800 text-right">{formatNumber(campaign.conversions)}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 text-right">{formatCurrency(campaign.revenue)}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setSelectedCampaign(campaign)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No completed campaigns yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CampaignPerformance;
