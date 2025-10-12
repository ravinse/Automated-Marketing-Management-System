import React from 'react';
import Navbarm from '../Marketingmanager/Navbarm';

const App = () => {
  

  const dashboardData = {
    totalUsers: 150,
    userRoles: [
      { role: "Managers", count: 30 },
      { role: "Staff", count: 100 },
      { role: "Analysts", count: 20 },
    ],
    activeCampaigns: [
      { status: "Running", count: 12 },
      { status: "Paused", count: 3 },
    ],
    dataSync: {
      integration: "POS Integration",
      status: "Connected",
    },
  };

  const Card = ({ title, value, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      <h3 className="text-gray-500 font-medium">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Global Navbar (second image style) */}
      <Navbarm />

      {/* Main Content */}
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {/* Total System Users Card */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Total System Users</h2>
          <Card title="Total System Users" value={dashboardData.totalUsers} className="max-w-md" />
        </div>

        {/* User Roles Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">User Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardData.userRoles.map((role, index) => (
              <Card key={index} title={role.role} value={role.count} />
            ))}
          </div>
        </div>

        {/* Active Campaigns Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Active Campaigns</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {dashboardData.activeCampaigns.map((campaign, index) => (
              <Card key={index} title={campaign.status} value={campaign.count} />
            ))}
          </div>
        </div>

        {/* Data Synchronization Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Data Synchronization</h2>
          <Card title={dashboardData.dataSync.integration} value={dashboardData.dataSync.status} className="max-w-lg" />
        </div>
      </div>
    </div>
  );
};

export default App;
