import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../assets/logo.png'
import profile from '../assets/profile.png'

const Navbarm = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Get user email and role from localStorage
  useEffect(() => {
    const email = localStorage.getItem('userEmail') || 'user@example.com';
    const role = localStorage.getItem('userRole') || 'Marketing Manager';
    setUserEmail(email);
    setUserRole(role);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Close dropdown first
    setIsDropdownOpen(false);
    
    // Clear localStorage completely
    localStorage.clear();
    
    // Small delay to ensure state updates
    setTimeout(() => {
      // Navigate to root page
      window.location.href = '/';
    }, 100);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="w-full border-b-2 p-3 border-gray-200 flex bg-white relative">
      {/* Logo */}
      <img src={Logo} alt="logo" className="w-14 h-8 ml-4 mt-2" />

      {/* Nav links */}
      <div className="ml-10">
        <nav className="flex sm:justify-center space-x-4">
          {[
            ['Dashboard', '/performance'],
            ['Campaigns', '/Campaign'],
            ['Templates', '/Template'],
            ['Performance', '/performanceoverview'],
            ['Feedback', '/Feedback'],
            
            
          ].map(([title, url]) => (
            <Link
              to={url}
              key={title}
              className="rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900"
            >
              {title}
            </Link>
          ))}
        </nav>
      </div>

      {/* Profile */}
      <div className="relative ml-auto mr-8 flex items-center gap-4">
        {/* Profile with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="rounded-full hover:opacity-80 transition-opacity"
          >
            <img
              src={profile}
              alt="profile"
              className="h-8 w-8 align-middle inline-block"
            />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {/* User Email */}
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm text-gray-500">Signed in as</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{userEmail}</p>
              </div>

              {/* Settings */}
              <Link
                to="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Settings
                </div>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                  Logout
                </div>
              </button>
            </div>
          )}
        </div>

        {/* User Info Button */}
        <button className="flex flex-col items-start px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          <span className="text-sm font-bold text-gray-800">{userRole}</span>
          <span className="text-xs text-gray-600">{userEmail}</span>
        </button>
      </div>
    </div>
  )
}

export default Navbarm
