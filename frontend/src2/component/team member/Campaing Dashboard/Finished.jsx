import React from 'react';

const Finished = () => {
  const finishedCampaigns = [
    {
      name: 'Back to School',
      type: 'Email',
      created: 'September 5, 2024',
      completed: 'September 5, 2024',
      status: 'Completed'
    },
    {
      name: 'Summer 90s',
      type: 'Email',
      created: 'September 5, 2024',
      completed: 'September 5, 2024',
      status: 'Completed'
    }
  ];

  return (
    <div className="bg-white px-6 py-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Finished</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Campaign Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Created</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Completed</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {finishedCampaigns.map((campaign, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-3 px-4 text-sm text-gray-900">{campaign.name}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{campaign.type}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{campaign.created}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{campaign.completed}</td>
                <td className="py-3 px-4 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {campaign.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Finished;