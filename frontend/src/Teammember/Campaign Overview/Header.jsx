import React from 'react';

const CampaignHeader = ({ 
  title = "Summer Sale Campaign", 
  campaignId = "Campaign ID: 123456",
  status = "Active",
  targetSegment = "All Customers",
  schedule = "July 1 - July 31, 2024",
  contentType = "Email"
}) => {
  return (
    <div className="bg-white px-8 py-8">
      {/* Campaign Title */}
      <h1 className="text-3xl font-bold text-black mb-2">
        {title}
      </h1>
      
      {/* Campaign ID */}
      <p className="text-sm text-gray-500 mb-8">
        {campaignId}
      </p>
      
      {/* Overview Section */}
      <div>
        <h2 className="text-xl font-bold text-black mb-8">Overview</h2>
        
        {/* Overview Grid */}
        <div className="grid grid-cols-12 gap-x-8 gap-y-8">
          {/* First Row with borders*/}
          <div className="col-span-3 border-t border-gray-200 pt-2">
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-base text-black mt-2">{status}</p>
          </div>
          
          <div className="col-span-9 border-t border-gray-200 pt-2">
              <p className="text-sm text-gray-500">Target Segment</p>
              <p className="text-base text-black mt-2">{targetSegment}</p>
          </div>
          
          {/* Second Row with borders */}
          <div className="col-span-3 border-t border-gray-200 pt-2">
              <p className="text-sm text-gray-500">Schedule</p>
              <p className="text-base text-black mt-2">{schedule}</p>
          </div>
          
          <div className="col-span-9 border-t border-gray-200 pt-2">
              <p className="text-sm text-gray-500">Content Type</p>
              <p className="text-base text-black mt-2">{contentType}</p>
          </div>
          </div>
        </div>
      </div>
  );
};

export default CampaignHeader;