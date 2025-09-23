import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';


const Table = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const campaigns = [
    {
      id: 1,
      name: 'Summer Sale',
      status: 'Active',
      targetSegment: 'Loyal Customers',
      startDate: '06/01/2024',
      endDate: '06/30/2024',
      channel: 'Email',
      createdBy: 'Sarah Lee'
    },
    {
      id: 2,
      name: 'Back to School',
      status: 'Paused',
      targetSegment: 'New Customers',
      startDate: '08/15/2024',
      endDate: '09/15/2024',
      channel: 'SMS',
      createdBy: 'Mark Chen'
    },
    {
      id: 3,
      name: 'Holiday Promotion',
      status: 'Draft',
      targetSegment: 'High-Value Customers',
      startDate: '11/20/2024',
      endDate: '12/25/2024',
      channel: 'Push Notification',
      createdBy: 'Emily Wong'
    },
    {
      id: 4,
      name: 'Spring Collection',
      status: 'Active',
      targetSegment: 'All Customers',
      startDate: '03/01/2024',
      endDate: '03/31/2024',
      channel: 'Email',
      createdBy: 'Sarah Lee'
    },
    {
      id: 5,
      name: 'Clearance Event',
      status: 'Paused',
      targetSegment: 'Price-Sensitive Customers',
      startDate: '01/05/2024',
      endDate: '01/19/2024',
      channel: 'SMS',
      createdBy: 'Mark Chen'
    }
  ];

  const getStatusBadge = (status) => {
    const statusStyles = {
      Active: 'bg-green-100 text-green-800',
      Paused: 'bg-yellow-100 text-yellow-800',
      Draft: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
        {status}
      </span>
    );
  };

  const getChannelBadge = (channel) => {
    const channelStyles = {
      Email: 'bg-blue-100 text-blue-800',
      SMS: 'bg-purple-100 text-purple-800',
      'Push Notification': 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${channelStyles[channel]}`}>
        {channel}
      </span>
    );
  };

  const handleDropdownToggle = (campaignId) => {
    setActiveDropdown(activeDropdown === campaignId ? null : campaignId);
  };

  return (
    <div className="bg-white px-6 pb-6">
      <div className="overflow-x-auto">
          <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Campaign Management</h2>
        </div>
        
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Campaign Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Target Segment</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Start & End Dates</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Channel</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Created By</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                </td>
                <td className="py-4 px-4">
                  {getStatusBadge(campaign.status)}
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600">{campaign.targetSegment}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600">
                    {campaign.startDate} - <br />
                    {campaign.endDate}
                  </div>
                </td>
                <td className="py-4 px-4">
                  {getChannelBadge(campaign.channel)}
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600">{campaign.createdBy}</div>
                </td>
                <td className="py-4 px-4 relative">
                  <button
                    onClick={() => handleDropdownToggle(campaign.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  
                  {activeDropdown === campaign.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                      <div className="py-1">
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Edit
                        </button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          View
                        </button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Duplicate
                        </button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;