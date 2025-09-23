import React from 'react';
import { Search, Bell } from 'lucide-react';
import ProfileImage from '../assets/Profile.png';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and navigation */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-black rounded-sm"></div>
            <span className="text-lg font-semibold text-gray-900">Campaign Central</span>
          </div>
          
          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-700 hover:text-gray-900 py-2 text-sm font-medium transition-colors">
              Dashboard
            </a>
            <a href="#" className="text-gray-900 py-2 text-sm font-medium border-b-2 border-gray-900 -mb-3">
              Campaigns
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 py-2 text-sm font-medium transition-colors">
              Reports
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 py-2 text-sm font-medium transition-colors">
              Audience
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 py-2 text-sm font-medium transition-colors">
              Automation
            </a>
          </nav>
        </div>

        {/* Right side - Search, notifications, and profile */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="block w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 transition-all"
            />
          </div>
          
          {/* Notification Bell */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          
          {/* Profile Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200">
            <img src={ProfileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;