import React from 'react';

const TipsSection = () => {
  return (
    <div className="p-6 absolute top-20 right-6">
      {/* Tips for Effective Campaigns Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Tips for Effective Campaigns
      </h3>
      
      {/* Description Text */}
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        Personalize your message, use a clear call to action, and segment your audience for better results.
      </p>
      
      {/* Campaign Setup Progress Section */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Campaign Setup Progress
        </h4>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2 mb-2">
          <div 
            className="bg-black h-2" 
            style={{ width: '60%' }}
          ></div>
        </div>
        
        {/* Progress Text */}
        <p className="text-xs text-gray-500">
          60% Complete
        </p>
      </div>
    </div>
  );
};

export default TipsSection;