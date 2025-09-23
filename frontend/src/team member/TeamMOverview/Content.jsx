import React from 'react';

const Content = ({ 
  subject = "Summer Savings are Here!",
  previewText = "Get ready for the hottest deals of the season! Enjoy up to 50% off on selected items. Shop now and make this summer unforgettable.",
  emailBody = "Get ready for the hottest deals of the season! Enjoy up to 50% off on selected items. Shop now and make this summer unforgettable."
}) => {
  return (
    <div className="bg-white px-6 py-6">
      {/* Content Title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Content</h2>
      
      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Subject */}
          <div className="col-span-3 border-t border-gray-200 pt-2">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              SUBJECT
            </label>
            <p className="text-sm text-gray-900 leading-relaxed pb-2">
              {subject}
            </p>
          </div>
          
          {/* SMS Body */}
          <div className="col-span-3 border-t border-gray-200 pt-2">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              SMS BODY
            </label>
            <p className="text-sm text-gray-900 leading-relaxed">
              {previewText}
            </p>
          </div>
        </div>
        
        {/* Right Column */}
        <div>
          {/* Email Text */}
            <div className="col-span-3 border-b border-t border-gray-200 pt-2">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              EMAIL BODY
            </label>
            <p className="text-sm text-gray-900 leading-relaxed pb-2">
              {emailBody}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;