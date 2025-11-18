import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Bell,
  User,
  ChevronDown,
} from 'lucide-react';
import Navbarm from './Navbarm';
import API from '../api';

// A reusable component for the key metrics cards
const MetricCard = ({ title, value, change, changeColor }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <div className="mt-2 flex items-baseline">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {change && <p className={`ml-2 text-xs font-semibold ${changeColor}`}>{change}</p>}
    </div>
  </div>
);

// The main application component
export default function App() {
  const primaryColor = '#4c51bf'; // A nice purple color for the dashboard accents

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [engagementSegments, setEngagementSegments] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========================================
  // DATA FETCHING
  // ========================================
  // Fetch campaigns on component mount
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Fetch campaign details when selection changes
  useEffect(() => {
    if (selectedCampaign) {
      fetchCampaignPerformance(selectedCampaign._id);
    }
  }, [selectedCampaign]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await API.get('/campaigns');
      const campaignsData = response.data.campaigns || response.data.items || [];
      
      // Filter to show only completed or running campaigns with metrics
      const executedCampaigns = campaignsData.filter(c => 
        (c.status === 'completed' || c.status === 'running') && 
        c.performanceMetrics?.sent > 0
      );
      
      setCampaigns(executedCampaigns);
      
      // Auto-select the most recent campaign
      if (executedCampaigns.length > 0) {
        setSelectedCampaign(executedCampaigns[0]);
      }
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignPerformance = async (campaignId) => {
    try {
      const response = await API.get(`/campaigns/${campaignId}`);
      const campaign = response.data;
      const pm = campaign.performanceMetrics || {};
      
      // Calculate metrics
      const sent = pm.sent || 0;
      const opened = pm.opened || 0;
      const clicked = pm.clicked || 0;
      const conversions = pm.conversions || 0;
      
      const openRate = sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0';
      const clickRate = sent > 0 ? ((clicked / sent) * 100).toFixed(1) : '0';
      const conversionRate = sent > 0 ? ((conversions / sent) * 100).toFixed(1) : '0';
      const engagementRate = sent > 0 ? (((opened + clicked) / (sent * 2)) * 100).toFixed(1) : '0';
      
      // Set metrics cards
      setMetrics([
        { title: 'Total Sent', value: sent.toLocaleString(), change: null, changeColor: '' },
        { title: 'Open Rate', value: `${openRate}%`, change: null, changeColor: '' },
        { title: 'Click Rate', value: `${clickRate}%`, change: null, changeColor: '' },
        { title: 'Conversions', value: conversions.toLocaleString(), change: null, changeColor: '' },
      ]);
      
      // Generate sample performance data for chart (in real app, fetch from tracking data)
      setPerformanceData([
        { name: 'Day 1', openRate: parseFloat(openRate) * 0.3, clickRate: parseFloat(clickRate) * 0.2 },
        { name: 'Day 2', openRate: parseFloat(openRate) * 0.5, clickRate: parseFloat(clickRate) * 0.4 },
        { name: 'Day 3', openRate: parseFloat(openRate) * 0.7, clickRate: parseFloat(clickRate) * 0.6 },
        { name: 'Day 4', openRate: parseFloat(openRate) * 0.85, clickRate: parseFloat(clickRate) * 0.8 },
        { name: 'Day 5', openRate: parseFloat(openRate), clickRate: parseFloat(clickRate) },
      ]);
      
      // Generate engagement segments based on customer segments
      const segments = campaign.customerSegments || [];
      setEngagementSegments(
        segments.map((segment, idx) => ({
          name: segment,
          engagement: Math.min(100, parseFloat(engagementRate) + (idx * 5))
        }))
      );
      
    } catch (err) {
      console.error('Failed to fetch campaign performance:', err);
      setError('Failed to load campaign performance data');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans antialiased text-gray-800">
      <Navbarm />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Campaign Performance Overview Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Campaign Performance Overview</h1>
          <p className="mt-1 text-gray-500">Analyze the effectiveness of your recent campaign with detailed metrics and insights.</p>
        </div>

        {/* Campaign Selector */}
        {campaigns.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Campaign</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCampaign?._id || ''}
              onChange={(e) => {
                const campaign = campaigns.find(c => c._id === e.target.value);
                setSelectedCampaign(campaign);
              }}
            >
              {campaigns.map((campaign) => (
                <option key={campaign._id} value={campaign._id}>
                  {campaign.title} - {campaign.status}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Campaign Details */}
        {selectedCampaign ? (
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 mb-8">
            <h2 className="text-lg font-bold mb-4">Campaign Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Campaign Name</p>
                <p className="mt-1 font-semibold text-gray-900">{selectedCampaign.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Target Audience</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {selectedCampaign.customerSegments?.join(', ') || 'All Customers'}
                </p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="mt-1 text-gray-900 leading-relaxed">
                  {selectedCampaign.description || 'No description available'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 mb-8 text-center">
            <p className="text-gray-500">
              {loading ? 'Loading campaigns...' : 'No executed campaigns available yet'}
            </p>
          </div>
        )}

        {/* Key Metrics Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.length > 0 ? (
              metrics.map((metric, index) => (
                <MetricCard
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  change={metric.change}
                  changeColor={metric.changeColor}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No metrics data available yet
              </div>
            )}
          </div>
        </div>

        {/* Performance Over Time Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Performance Over Time</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Open Rate Trend Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Open Rate Trend</h3>
              <div className="flex items-baseline mt-2">
                <p className="text-xl font-bold text-gray-900">--</p>
                <p className="ml-2 text-xs font-semibold text-gray-400">Last 30 Days</p>
              </div>
              <div className="mt-4 h-40 w-full flex items-center justify-center">
                {performanceData.length > 0 ? (
                  <ResponsiveContainer>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <YAxis hide domain={['dataMin', 'dataMax']} />
                      <Tooltip />
                      <Line type="monotone" dataKey="openRate" stroke={primaryColor} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400">No performance data available</p>
                )}
              </div>
            </div>

            {/* Click-Through Rate Trend Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Click-Through Rate Trend</h3>
              <div className="flex items-baseline mt-2">
                <p className="text-xl font-bold text-gray-900">--</p>
                <p className="ml-2 text-xs font-semibold text-gray-400">Last 30 Days</p>
              </div>
              <div className="mt-4 h-40 w-full flex items-center justify-center">
                {performanceData.length > 0 ? (
                  <ResponsiveContainer>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <YAxis hide domain={['dataMin', 'dataMax']} />
                      <Tooltip />
                      <Line type="monotone" dataKey="clickRate" stroke={primaryColor} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-400">No performance data available</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Audience Engagement Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Audience Engagement</h2>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h3 className="text-base font-medium text-gray-900">Engagement by Customer Segment</h3>
            <div className="flex items-baseline mt-2 mb-4">
              <p className="text-xl font-bold text-gray-900">--</p>
              <p className="ml-2 text-xs font-semibold text-gray-400">Current</p>
            </div>
            <div className="space-y-4">
              {engagementSegments.length > 0 ? (
                engagementSegments.map((segment, index) => (
                  <div key={index}>
                    <p className="text-sm text-gray-600 mb-1">{segment.name}</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${segment.engagement}%`, backgroundColor: primaryColor }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-700">{segment.engagement}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-4">No engagement data available</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

