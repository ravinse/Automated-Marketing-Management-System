import React, { useState } from 'react';
import { Upload, Eye, EyeOff } from 'lucide-react';
import Navbar from './Navbar.jsx';

const SettingsForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    emailNotifications: false,
    pushNotifications: false,
    smsNotifications: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Profile picture uploaded:', file.name);
      // Handle file upload here
    }
  };

  return (
    <div className="bg-white p-4 mx-auto">
      <Navbar />
      <div className="max-w-2xl mx-auto">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 mt-0 mb-4">Manage your personal information and preferences.</p>
        </div>
        
        {/* Personal Information Section */}
        <div className="mb-4">
          <h2 className="text-base font-medium text-gray-900 mb-2">Personal Information</h2>

          {/* Full Name */}
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          {/* Profile Picture */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture
            </label>
            <div className="flex items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors cursor-pointer bg-gray-50">
              <label htmlFor="profilePicture" className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload profile picture</span>
                <input
                  type="file"
                  id="profilePicture"
                  className="hidden"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="mb-4">
          <h2 className="text-base font-medium text-gray-900 mb-2">Security</h2>
          
          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-1 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="mb-4">
          <h2 className="text-base font-medium text-gray-900 mb-2">Notifications</h2>
          
          <div className="space-y-2">
            {/* Email Notifications */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="emailNotifications" className="ml-3 text-sm font-medium text-gray-700">
                Email Notifications
              </label>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pushNotifications"
                name="pushNotifications"
                checked={formData.pushNotifications}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="pushNotifications" className="ml-3 text-sm font-medium text-gray-700">
                Push Notifications
              </label>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smsNotifications"
                name="smsNotifications"
                checked={formData.smsNotifications}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="pushNotifications" className="ml-3 text-sm font-medium text-gray-700">
                SMS Notifications
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsForm;