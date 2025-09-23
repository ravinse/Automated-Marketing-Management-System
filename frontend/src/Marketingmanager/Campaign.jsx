import React, { useState } from 'react';
import PendingApproval from '../Tables/PendingApproval.jsx';
import Running from '../Tables/Running.jsx'
import Completed from '../Tables/Completed.jsx';
import { Link } from 'react-router-dom';
import MarketingManagerNavbar from './MarketingManagerNavbar.jsx';


const Campaign = () => {
  const [activeTab, setActiveTab] = useState('Pending Approval');
  const tabs = ['Pending Approval', 'Running', 'Completed'];
  return (
    <div className='min-h-screen'>
      <div>
        <MarketingManagerNavbar />
      </div>
      <div className="flex flex-row p-4">
       <div> <h1 className="text-2xl font-bold ml-64 mt-7">Campaigns</h1></div>
     <div className='ml-auto mr-64'><Link to="/campaigncreation" ><button className="bg-[#F2F2F5] text-black px-4 py-2 rounded-full ml-auto mr-64 mt-7 hover:bg-[#E0E0E5]">
          Create Campaign
        </button></Link></div>
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
    </div>
  )
}

export default Campaign
