import React from 'react';
import { Link } from 'react-router-dom';

const Drafted = () => {
  const draftedCampaigns = [
    {
      id: '20250807',
      name: 'Back to School',
      type: 'Email',
      submitted: 'September 5, 2024',
      status: 'Draft'
    },
    {
      id: '20250809',
      name: 'Holiday Vibes',
      type: 'Email',
      submitted: 'September 5, 2024',
      status: 'Draft'
    }
  ];

  return (
    <div className="bg-white px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Drafted</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Campaign Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">ID</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Submitted</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {draftedCampaigns.map((campaign, index) => (
              <tr key={campaign.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-3 px-4 text-sm text-gray-900">{campaign.name}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{campaign.id}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{campaign.type}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{campaign.submitted}</td>
                <td className="py-3 px-4 text-sm">
                  <span className="text-gray-600">{campaign.status}</span>
                </td>
                <td className="py-3 px-4 text-sm">
                 <Link to="/newcampaign"> <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Edit
                  </button></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Drafted;