import React, { useState, useEffect } from 'react';
import OwnerNavbar from './homepage/OwnerNavbar';
import API from '../api';

const StrategicDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalRevenue: '0',
    revenueGrowth: '+0%',
    customerGrowth: '+0%',
    customerLoyalty: '0%',
    runningCampaigns: [],
    totalCustomers: 0,
    loyalCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStrategicMetrics();
  }, []);

  const fetchStrategicMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/campaigns/strategic-metrics');
      setMetrics(response.data);
    } catch (err) {
      console.error('Error fetching strategic metrics:', err);
      // Set default values instead of showing error
      setMetrics({
        totalRevenue: '0',
        revenueGrowth: '-',
        customerGrowth: '-',
        customerLoyalty: '-',
        runningCampaigns: [],
        totalCustomers: 0,
        loyalCustomers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OwnerNavbar />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading strategic metrics...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OwnerNavbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Strategic Dashboard</h1>
        <p className="text-gray-600 mb-6">Overview of your business performance and strategic actions</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-gray-500 text-sm">Total Revenue</div>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.totalRevenue)}</div>
            <div className={`text-sm ${metrics.revenueGrowth.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
              {metrics.revenueGrowth}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-gray-500 text-sm">Customer Growth</div>
            <div className="text-3xl font-bold text-gray-900">{metrics.customerGrowth}</div>
            <div className={`text-sm ${metrics.customerGrowth.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
              vs last month
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-gray-500 text-sm">Customer Loyalty</div>
            <div className="text-3xl font-bold text-gray-900">{metrics.customerLoyalty}</div>
            <div className="text-sm text-gray-600">
              {metrics.loyalCustomers} of {metrics.totalCustomers} customers
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="text-gray-900 font-semibold mb-4">Running Campaigns</div>
          {metrics.runningCampaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-sm font-medium">Campaign Name</th>
                    <th className="px-6 py-3 text-sm font-medium">Revenue</th>
                    <th className="px-6 py-3 text-sm font-medium">Engagement</th>
                    <th className="px-6 py-3 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {metrics.runningCampaigns.map((campaign) => (
                    <tr key={campaign._id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-800">{campaign.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-800">{formatCurrency(campaign.revenue)}</td>
                      <td className="px-6 py-3 text-sm text-gray-800">{campaign.engagement}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {campaign.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No running campaigns</div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-gray-900 font-semibold mb-2">Customer Loyalty Trends</div>
          <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 text-sm">
            Chart showing {metrics.loyalCustomers} loyal customers ({metrics.customerLoyalty} loyalty rate)
          </div>
        </div>
      </div>
    </div>
  );
}

export default StrategicDashboard;
