import React, { useState } from 'react';
import { X, TrendingUp, Users, MousePointer, DollarSign } from 'lucide-react';


const AdminPerformanceDashboard = () => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const campaigns = [
    {
      name: 'Summer Sale',
      status: 'Active',
      sent: 5000,
      openRate: '25%',
      clickThroughRate: '5%',
      conversions: 100,
      analytics: {
        totalRevenue: '$12,500',
        costPerClick: '$2.15',
        returnOnInvestment: '340%',
        topPerformingSubject: 'Limited Time: 50% Off Everything!',
        bestSendTime: '10:00 AM - 12:00 PM',
        deviceBreakdown: { mobile: 60, desktop: 35, tablet: 5 }
      }
    },
    {
      name: 'Back to School',
      status: 'Completed',
      sent: 4500,
      openRate: '22%',
      clickThroughRate: '4%',
      conversions: 90,
      analytics: {
        totalRevenue: '$9,800',
        costPerClick: '$2.45',
        returnOnInvestment: '285%',
        topPerformingSubject: 'Get Ready for School - 30% Off Supplies',
        bestSendTime: '2:00 PM - 4:00 PM',
        deviceBreakdown: { mobile: 55, desktop: 40, tablet: 5 }
      }
    },
    {
      name: 'Holiday Promotion',
      status: 'Completed',
      sent: 6000,
      openRate: '30%',
      clickThroughRate: '6%',
      conversions: 150,
      analytics: {
        totalRevenue: '$18,750',
        costPerClick: '$1.95',
        returnOnInvestment: '425%',
        topPerformingSubject: '🎄 Holiday Special: Buy 2 Get 1 Free',
        bestSendTime: '9:00 AM - 11:00 AM',
        deviceBreakdown: { mobile: 65, desktop: 30, tablet: 5 }
      }
    },
    {
      name: 'New Product Launch',
      status: 'Active',
      sent: 3000,
      openRate: '20%',
      clickThroughRate: '3%',
      conversions: 60,
      analytics: {
        totalRevenue: '$7,200',
        costPerClick: '$2.80',
        returnOnInvestment: '220%',
        topPerformingSubject: 'Introducing Our Latest Innovation',
        bestSendTime: '11:00 AM - 1:00 PM',
        deviceBreakdown: { mobile: 58, desktop: 38, tablet: 4 }
      }
    },
    {
      name: 'Customer Appreciation',
      status: 'Completed',
      sent: 4000,
      openRate: '28%',
      clickThroughRate: '5.5%',
      conversions: 110,
      analytics: {
        totalRevenue: '$14,300',
        costPerClick: '$2.25',
        returnOnInvestment: '380%',
        topPerformingSubject: 'Thank You! Exclusive 25% Discount Inside',
        bestSendTime: '3:00 PM - 5:00 PM',
        deviceBreakdown: { mobile: 62, desktop: 33, tablet: 5 }
      }
    }
  ];

  const handleViewAnalytics = (campaign) => {
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCampaign(null);
  };

  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Completed
        </span>
      );
    }
  };

  return (
    <div className="bg-gray-50 px-6 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Table Section Header */}
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
                {campaigns.map((campaign, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {campaign.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.sent.toLocaleString()}
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
                ))}
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

export default AdminPerformanceDashboard;