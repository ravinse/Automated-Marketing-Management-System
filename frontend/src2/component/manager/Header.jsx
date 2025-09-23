import React from 'react';
import Navbar from './Navbar.jsx';

const Header = () => {
  return (
    <div className="bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Performance</h1>
          <p className="text-gray-600">Track the performance of your campaigns and optimize for better results.</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Campaigns Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Campaigns</h3>
              <p className="text-3xl font-bold text-gray-900">25</p>
            </div>
          </div>
          
          {/* Active Campaigns Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Active Campaigns</h3>
              <p className="text-3xl font-bold text-gray-900">5</p>
            </div>
          </div>
          
          {/* Campaigns Completed Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Campaigns Completed</h3>
              <p className="text-3xl font-bold text-gray-900">20</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;