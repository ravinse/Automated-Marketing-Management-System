import React from 'react';
import Navbarm from '../Marketingmanager/Navbarm';

const AdminDashboard = () => {
  // Simple Card component for displaying stats
  const Card = ({ title, value }) => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-gray-500 font-medium">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <Navbarm />

      {/* Main Dashboard Content */}
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {/* System Overview Section - Display total users */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">System Overview</h2>
          <Card title="Total System Users" value="150" />
        </div>

        {/* User Roles Breakdown - Show count per role type */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">User Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card title="Managers" value="30" />
            <Card title="Staff" value="100" />
            <Card title="Analysts" value="20" />
          </div>
        </div>

        {/* Campaign Status - Active campaigns overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Active Campaigns</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card title="Running" value="12" />
            <Card title="Paused" value="3" />
          </div>
        </div>

        {/* Data Integration Status - POS system connection */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Data Synchronization</h2>
          <Card title="POS Integration" value="Connected" />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
