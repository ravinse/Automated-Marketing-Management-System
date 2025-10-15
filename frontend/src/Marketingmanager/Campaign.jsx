import React, { useState } from 'react';
import PendingApproval from '../Tables/PendingApproval.jsx';
import Approved from '../Tables/Approved.jsx';
import Running from '../Tables/Running.jsx'
import Completed from '../Tables/Completed.jsx';
import { Link } from 'react-router-dom';
import Navbarm from './Navbarm.jsx';


const Campaign = () => {
  const [activeTab, setActiveTab] = useState('Pending Approval');
  const tabs = ['Pending Approval', 'Approved', 'Running', 'Completed'];
  return (
    <>
      <div>
        <Navbarm />
      </div>
      
      {/* Page Container with responsive padding */}
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Campaigns</h1>
            <Link to="/createcampaingm">
              <button className="bg-[#F2F2F5] text-black px-6 py-2.5 rounded-full hover:bg-[#E0E0E5] transition-colors font-medium shadow-sm w-full sm:w-auto">
                Create Campaign
              </button>
            </Link>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tabName) => (
                <button
                  key={tabName}
                  onClick={() => setActiveTab(tabName)}
                  className={`whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tabName
                      ? 'border-[#00af96] text-[#00af96]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tabName}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'Pending Approval' && <PendingApproval />}
          {activeTab === 'Approved' && <Approved />}
          {activeTab === 'Running' && <Running />}
          {activeTab === 'Completed' && <Completed />}
        </div>
      </div>
    </>
  )
}

export default Campaign
