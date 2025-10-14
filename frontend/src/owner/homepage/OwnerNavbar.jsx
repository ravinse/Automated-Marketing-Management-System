import React, { useState, useRef, useEffect } from 'react';
import { Bell, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Profile from '../../assets/Profile.png';
import API from '../../api';
// Helper to resolve backend relative avatar paths
const resolveAvatarUrl = (val) => {
  if (!val) return null;
  try {
    if (typeof val !== 'string') return null;
    if (val.startsWith('http') || val.startsWith('data:')) return val;
    const base = (API?.defaults?.baseURL || '').replace(/\/?api\/?$/, '');
    return `${base}${val}`;
  } catch {
    return val;
  }
};
import Logo from '../../assets/logo.png';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await API.get('/auth/profile');
        const userData = response.data;
        
        setUserEmail(userData.email);
        setUserName(userData.name);
        setUserRole(userData.role);
        // Resolve and set profile image
        if (userData.profileImage) {
          const resolved = resolveAvatarUrl(userData.profileImage);
          setProfileImage(resolved);
          try { localStorage.setItem('userProfileImage', resolved); } catch { /* ignore */ }
        } else {
          // try to read cached image from localStorage
          const cached = localStorage.getItem('userProfileImage');
          if (cached) setProfileImage(cached);
        }
        
        // Also update localStorage for backward compatibility
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userRole', userData.role);
        
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Fallback to localStorage if API fails
        const email = localStorage.getItem('userEmail') || 'owner@example.com';
        const name = localStorage.getItem('userName') || 'Owner';
        const role = localStorage.getItem('userRole') || 'Owner';
        
        setUserEmail(email);
        setUserName(name);
        setUserRole(role);
      } finally {
        // Optional: cleanup or final actions
      }
    };

    fetchUserData();

    // Listen for profile update events (dispatched by Settings)
    const onProfileUpdate = (e) => {
      const img = e?.detail?.profileImage;
      if (img) setProfileImage(img);
    };
    window.addEventListener('userProfileUpdated', onProfileUpdate);

    return () => {
      window.removeEventListener('userProfileUpdated', onProfileUpdate);
    };
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
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      localStorage.removeItem('role');
      navigate('/');
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <button onClick={() => navigate('/owner')} className="flex items-center space-x-2" title="Owner Home">
            <img src={Logo} alt="Logo" className="h-8 w-14" />
          </button>
          
          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link to="/owner" className="text-gray-900 font-medium hover:text-gray-700">Home</Link>
            <Link to="/owner/performance" className="text-gray-900 font-medium hover:text-gray-700">Dashboard</Link>
            <Link to="/owner/campaign-overview" className="text-gray-500 hover:text-gray-700">Campaigns</Link>
            <Link to="/owner/feedback" className="text-gray-500 hover:text-gray-700">Feedback</Link>
            <Link to="/owner/strategic" className="text-gray-500 hover:text-gray-700">Reports</Link>
          </div>
        </div>
        
        {/* Right side - Search and Profile */}
        <div className="flex items-center space-x-4">
          
          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="w-8 h-8 rounded-full overflow-hidden hover:opacity-80 transition-opacity"
              >
                <img
                  src={profileImage || Profile}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User Email */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm text-gray-500">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
                  <p className="text-xs text-gray-600 truncate">{userEmail}</p>
                  <p className="text-xs text-blue-600 font-medium">{userRole}</p>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;