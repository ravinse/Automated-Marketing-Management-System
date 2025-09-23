import React from 'react';

const ActionButtons = ({ 
  onEditClick = () => console.log('Edit Campaign clicked'),
  onDeleteClick = () => console.log('Delete clicked')
}) => {
  return (
    <div className="bg-white px-8 py-8">
      <div className="flex space-x-3">
        {/* Edit Campaign Button */}
        <button
          onClick={onEditClick}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors"
        >
          Edit Campaign
        </button>
        
        {/* Delete Button */}
        <button
          onClick={onDeleteClick}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;

