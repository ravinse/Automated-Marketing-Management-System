import { Link as LucideLink } from 'lucide-react'; // alias to avoid conflict
import React from 'react';
import { Link } from 'react-router-dom'; // this Link is used in your JSX

const Header = () => {
  return (
    <div className="bg-white px-6 py-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>

        <Link to="/createcampaingt">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
            New Campaign
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Header;
