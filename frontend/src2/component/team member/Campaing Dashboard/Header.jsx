import React from 'react';

const Header = () => {
  return (
    <div className="bg-white px-6 py-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
          New Campaign
        </button>
      </div>
    </div>
  );
};

export default Header;