import React from 'react';
import { Bell, User } from 'lucide-react';
import Profile from '../../assets/Profile.png';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 mx-auto">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold">■</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">May Fashion</span>
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-6 mx-auto">
            <a href="#" className="text-gray-900 font-medium hover:text-gray-700">Campaigns</a>
            <a href="#" className="text-gray-500 hover:text-gray-700">Analytics</a>
            <a href="#" className="text-gray-500 hover:text-gray-700">Feedback</a>
          </div>
        </div>
        
        {/* Right side - Search and Profile */}
        <div className="flex items-center space-x-4">
          
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