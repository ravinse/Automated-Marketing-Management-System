import React, { useState } from 'react';

const CreateCampaign = () => {
  const [campaignTitle, setCampaignTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Campaign</h2>
      <p className="text-sm text-gray-600 mb-6">
        Find and connect with potential customers, target audience, and continue informative campaigns
      </p>
      
      <div className="space-y-4 max-w-lg">
        <div>
          <label htmlFor="campaignTitle" className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Title
          </label>
          <input
            type="text"
            id="campaignTitle"
            value={campaignTitle}
            onChange={(e) => setCampaignTitle(e.target.value)}
            placeholder="Enter campaign title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter campaign description..."
          />
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;