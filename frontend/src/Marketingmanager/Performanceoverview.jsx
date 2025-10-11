import React from 'react';
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

  // Empty data arrays - ready for API integration
  const performanceData = [];
  const engagementSegments = [];
  const metrics = [];

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

        {/* Campaign Details */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 mb-8">
          <h2 className="text-lg font-bold mb-4">Campaign Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Campaign Name</p>
              <p className="mt-1 font-semibold text-gray-900">Summer Sale 2024</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Target Audience</p>
              <p className="mt-1 font-semibold text-gray-900">Loyal Customers</p>
            </div>
            <div className="col-span-1 md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Content</p>
              <p className="mt-1 text-gray-900 leading-relaxed">Engage with promotional offers and new product announcements</p>
            </div>
          </div>
        </div>

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

