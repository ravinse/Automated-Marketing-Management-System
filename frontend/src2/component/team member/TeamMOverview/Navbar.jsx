import React from 'react';
import { Bell, User } from 'lucide-react';
import Profile from '../assets/Profile.png';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold">■</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Campaign Central</span>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-900 font-medium hover:text-gray-700">Campaigns</a>
            <a href="#" className="text-gray-500 hover:text-gray-700">Templates</a>
            <a href="#" className="text-gray-500 hover:text-gray-700">Reports</a>
            <a href="#" className="text-gray-500 hover:text-gray-700">Automation</a>
            <a href="#" className="text-gray-500 hover:text-gray-700">Audience</a>
          </div>
        </div>
        
        {/* Right side - Search and Profile */}
        <div className="flex items-center space-x-4">
          {/* Search Icon */}
          <button className="p-2 hover:bg-gray-100 rounded-md">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          {/* Notification Bell */}
          <button className="p-2 hover:bg-gray-100 rounded-md relative">
            <Bell className="w-5 h-5 text-gray-500" />
          </button>
          
          {/* Profile */}
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src={Profile} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;