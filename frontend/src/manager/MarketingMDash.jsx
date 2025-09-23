import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MMnav from '../Navbar/MMnav.jsx';
import PendingApproval from '../Tables/PendingApproval.jsx';
import Running from '../Tables/Running.jsx'
import Completed from '../Tables/Completed.jsx';

const Campaign = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Pending Approval');
  const tabs = ['Pending Approval', 'Running', 'Completed'];

  // Determine active section based on current route
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('/templates')) return 'Templates';
    if (path.includes('/reports')) return 'Reports';
    if (path.includes('/audience')) return 'Audience';
    return 'Campaigns'; // default to campaigns for /manager
  };

  const renderContent = () => {
    const section = getActiveSection();

    switch (section) {
      case 'Templates':
        return (
          <div className="p-8 min-h-screen">
            <div className="mx-52">
              <h2 className="text-2xl font-bold mb-4">Templates</h2>
              <p className="text-gray-600">Template management section - Coming soon</p>
            </div>
          </div>
        );
      case 'Reports':
        return (
          <div className="p-8 min-h-screen">
            <div className="mx-52">
              <h2 className="text-2xl font-bold mb-4">Reports</h2>
              <p className="text-gray-600">Reports and analytics section - Coming soon</p>
            </div>
          </div>
        );
      case 'Audience':
        return (
          <div className="p-8 min-h-screen">
            <div className="mx-52">
              <h2 className="text-2xl font-bold mb-4">Audience</h2>
              <p className="text-gray-600">Audience management section - Coming soon</p>
            </div>
          </div>
        );
      default: // Campaigns
        return (
          <>
            <div className="flex flex-row p-4">
              <h1 className="text-2xl font-bold ml-64 mt-7">Campaigns</h1>
              <button className="bg-[#F2F2F5] text-black px-4 py-2 rounded-full ml-auto mr-64 mt-7 hover:bg-[#E0E0E5]">
                Create Campaign
              </button>
            </div>
            <div className="p-8 min-h-screen">

            <div className="mt-1 border-b border-gray-200 mx-52">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tabName) => (
                  <button
                    key={tabName}
                    onClick={() => setActiveTab(tabName)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
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
            <div className="mt-8 mr-10">
              {activeTab === 'Pending Approval' && <div><PendingApproval /></div>}
              {activeTab === 'Running' && <div><Running /></div>}
              {activeTab === 'Completed' && <div><Completed /></div>}
            </div>
          </div>
        </>
        );
    }
  };
  return (
    <>
      <div>
        <MMnav />
      </div>
      {renderContent()}
    </>
  )
}

export default Campaign
