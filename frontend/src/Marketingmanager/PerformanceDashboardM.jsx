import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Users, MousePointer, DollarSign } from 'lucide-react';
import Navbarm from './Navbarm';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const Performance_dashboardm = () => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeCampaignsCount, setActiveCampaignsCount] = useState(0);
  const [totalCampaignsCount, setTotalCampaignsCount] = useState(0);
  const [completedCampaignsCount, setCompletedCampaignsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);

  // Fetch campaign counts on component mount
  useEffect(() => {
    fetchCampaignCounts();
    fetchAllCampaigns();
  }, []);

  const fetchAllCampaigns = async () => {
    try {
      const response = await fetch(`${API_URL}/campaigns`);
      const data = await response.json();
      const campaignsData = data.items || [];
      
      // Map database campaigns to display format
      const mappedCampaigns = campaignsData.map(camp => ({
        _id: camp._id,
        name: camp.title,
        status: getDisplayStatus(camp.status),
        sent: camp.sent || 0,
        openRate: camp.openRate || '0%',
        clickThroughRate: camp.clickThroughRate || '0%',
        conversions: camp.conversions || 0,
        startDate: camp.startDate,
        endDate: camp.endDate,
        description: camp.description,
        customerSegments: camp.customerSegments || [],
        analytics: {
          totalRevenue: camp.totalRevenue || '$0',
          costPerClick: camp.costPerClick || '$0',
          returnOnInvestment: camp.returnOnInvestment || '0%',
          topPerformingSubject: camp.emailSubject || 'N/A',
          bestSendTime: 'N/A',
          deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 }
        }
      }));
      
      setCampaigns(mappedCampaigns);
      console.log('Fetched campaigns:', mappedCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const getDisplayStatus = (status) => {
    const statusMap = {
      'draft': 'Draft',
      'pending_approval': 'Pending',
      'running': 'Active',
      'completed': 'Completed',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status;
  };

  const fetchCampaignCounts = async () => {
    try {
      setLoading(true);
      
      // Fetch running campaigns count
      const runningResponse = await fetch(`${API_URL}/campaigns?status=running`);
      const runningData = await runningResponse.json();
      setActiveCampaignsCount(runningData.total || 0);

      // Fetch completed campaigns count
      const completedResponse = await fetch(`${API_URL}/campaigns?status=completed`);
      const completedData = await completedResponse.json();
      setCompletedCampaignsCount(completedData.total || 0);

      // Fetch total campaigns count
      const totalResponse = await fetch(`${API_URL}/campaigns`);
      const totalData = await totalResponse.json();
      setTotalCampaignsCount(totalData.total || 0);

    } catch (error) {
      console.error('Error fetching campaign counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnalytics = (campaign) => {
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCampaign(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        label: 'Active'
      },
      'Completed': {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        label: 'Completed'
      },
      'Pending': {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        label: 'Pending'
      },
      'Draft': {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        label: 'Draft'
      },
      'Rejected': {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        label: 'Rejected'
      }
    };

    const config = statusConfig[status] || {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      label: status
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbarm />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Table Section Header */}
        <div className='mb-2'>
          <h1 className='text-2xl font-bold text-gray-900'>Campaign Performance</h1>
        </div>
        <div className='mb-6'>
          <p className="text-gray-500">Track the performance of your campaigns and optimize for better results.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Campaigns */}
          <div className="border rounded-lg p-6 shadow-sm bg-white">
            <h3 className="text-gray-600 mb-2">Total Campaigns</h3>
            <p className="text-2xl font-bold">
              {loading ? '...' : totalCampaignsCount}
            </p>
          </div>

          {/* Active Campaigns */}
          <div className="border rounded-lg p-6 shadow-sm bg-white">
            <h3 className="text-gray-600 mb-2">Active Campaigns</h3>
            <p className="text-2xl font-bold">
              {loading ? '...' : activeCampaignsCount}
            </p>
          </div>

          {/* Campaigns Completed */}
          <div className="border rounded-lg p-6 shadow-sm bg-white">
            <h3 className="text-gray-600 mb-2">Campaigns Completed</h3>
            <p className="text-2xl font-bold">
              {loading ? '...' : completedCampaignsCount}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Campaign Metrics</h2>
        </div>
        
        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table Header */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Open Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Click-Through Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    View Analytics
                  </th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Loading campaigns...
                    </td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No campaigns found
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => (
                    <tr key={campaign._id || campaign.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {campaign.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(campaign.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.sent ? campaign.sent.toLocaleString() : '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.openRate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.clickThroughRate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.conversions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleViewAnalytics(campaign)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Analytics Modal */}
      {showModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                View Analytics - {selectedCampaign.name}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Key Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-blue-900">{selectedCampaign.analytics.totalRevenue}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <MousePointer className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Cost Per Click</p>
                      <p className="text-2xl font-bold text-green-900">{selectedCampaign.analytics.costPerClick}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">ROI</p>
                      <p className="text-2xl font-bold text-purple-900">{selectedCampaign.analytics.returnOnInvestment}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-600">Conversions</p>
                      <p className="text-2xl font-bold text-orange-900">{selectedCampaign.conversions}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Performance Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emails Sent:</span>
                      <span className="font-medium">{selectedCampaign.sent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Open Rate:</span>
                      <span className="font-medium">{selectedCampaign.openRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Click-Through Rate:</span>
                      <span className="font-medium">{selectedCampaign.clickThroughRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium">{selectedCampaign.status}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Mobile:</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: `${selectedCampaign.analytics.deviceBreakdown.mobile}%`}}></div>
                        </div>
                        <span className="font-medium">{selectedCampaign.analytics.deviceBreakdown.mobile}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Desktop:</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: `${selectedCampaign.analytics.deviceBreakdown.desktop}%`}}></div>
                        </div>
                        <span className="font-medium">{selectedCampaign.analytics.deviceBreakdown.desktop}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tablet:</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: `${selectedCampaign.analytics.deviceBreakdown.tablet}%`}}></div>
                        </div>
                        <span className="font-medium">{selectedCampaign.analytics.deviceBreakdown.tablet}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Insights */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Insights</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Top Performing Subject Line:</p>
                    <p className="font-medium text-gray-900">{selectedCampaign.analytics.topPerformingSubject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Best Send Time:</p>
                    <p className="font-medium text-gray-900">{selectedCampaign.analytics.bestSendTime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance_dashboardm;