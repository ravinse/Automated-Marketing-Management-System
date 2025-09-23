import React from 'react';
import Navbar from './OwnerNavbar.jsx';

const Campaign = ({
  title = "Summer Sale Campaign",
  campaignId = "Campaign ID: 123456",
  status = "Active",
  targetSegment = "All Customers",
  schedule = "July 1 - July 31, 2024",
  contentType = "Email",
  subject = "Summer Savings are Here!",
  emailBody = "Get ready for the hottest deals of the season! Enjoy up to 50% off on selected items. Shop now and make this summer unforgettable."
}) => {
  return (
    <div className="bg-white px-8 py-8">
      {/* Campaign Header */}
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
          {/* First Row with borders */}
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

      {/* Content Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-black mb-8">Content</h2>
        
        {/* Content Grid aligned with Overview */}
        <div className="grid grid-cols-12 gap-x-8 gap-y-8">
          {/* Subject */}
          <div className="col-span-3 border-t border-gray-200 pt-2">
            <p className="text-sm text-gray-500">Subject</p>
            <p className="text-base text-black mt-2">{subject}</p>
          </div>
          
          {/* Email Body aligned with Target Segment and Content Type */}
          <div className="col-span-9 border-t border-gray-200 pt-2">
            <p className="text-sm text-gray-500">Email Body</p>
            <p className="text-base text-black mt-2">{emailBody}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaign;