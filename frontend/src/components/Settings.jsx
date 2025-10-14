import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbarm from '../Marketingmanager/Navbarm';
import Navbart from '../team member/Navbart';
import OwnerNavbar from '../owner/homepage/OwnerNavbar';
import API from '../api';

const Settings = () => {
  // Derive backend origin (e.g., http://localhost:5001) from API baseURL
  const backendOrigin = (API?.defaults?.baseURL || '')
    .replace(/\/?api\/?$/, '');
  const resolveAvatarUrl = useCallback((val) => {
    if (!val) return null;
    if (typeof val !== 'string') return null;
    if (val.startsWith('http') || val.startsWith('data:')) return val;
    // assume backend relative like /uploads/...
    return `${backendOrigin}${val}`;
  }, [backendOrigin]);
  const [activeTab, setActiveTab] = useState('profile');
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    username: '',
    role: '',
    phone: '',
    department: '',
    profileImage: null,
  });
  
  const [loading, setLoading] = useState(true);
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    campaignUpdates: true,
    systemAlerts: false,
    weeklyReports: true
  });

  const [security, setSecurity] = useState({
    sessionTimeout: '30',
    passwordExpiry: '90'
  });

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  // Load user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await API.get('/auth/profile');
  const userData = response.data;
        
        setUserInfo(prev => ({
          ...prev,
          name: userData.name,
          email: userData.email,
          username: userData.username,
          role: userData.role,
          profileImage: userData.profileImage || null,
        }));
        if (userData.profileImage) {
          setAvatarPreview(resolveAvatarUrl(userData.profileImage));
        }
        
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Fallback to localStorage if API fails
        const role = localStorage.getItem('role') || localStorage.getItem('userRole');
        const email = localStorage.getItem('userEmail');
        const name = localStorage.getItem('userName');
        
        setUserInfo(prev => ({
          ...prev,
          email: email || 'user@example.com',
          role: role || 'team member',
          name: name || 'User',
          profileImage: null,
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [resolveAvatarUrl]);

  const handleUserInfoChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field, value) => {
    setNotifications(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecurityChange = (field, value) => {
    setSecurity(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const onAvatarFileChange = (e) => {
    setAvatarError('');
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setAvatarError('Please select a PNG, JPG, or WEBP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image size must be 2MB or smaller.');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async () => {
    if (!avatarFile) {
      setAvatarError('Please choose an image first.');
      return;
    }
    try {
      setAvatarUploading(true);
      setAvatarError('');
      const form = new FormData();
      form.append('avatar', avatarFile);
      const res = await API.post('/auth/profile/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  const newUrl = resolveAvatarUrl(res.data.profileImage);
      setUserInfo(prev => ({ ...prev, profileImage: newUrl }));
      setAvatarPreview(newUrl);
      // Persist and broadcast the updated profile image so navbars across the app can update
      try {
        localStorage.setItem('userProfileImage', newUrl);
        window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: { profileImage: newUrl } }));
      } catch (e) {
        console.warn('Could not persist profile image to localStorage', e);
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      const msg = err?.response?.data?.error || 'Failed to upload image';
      setAvatarError(msg);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = () => {
    saveProfile();
  };

  const [saveStatus, setSaveStatus] = useState({ loading: false, message: '', error: '' });

  const saveProfile = async () => {
    try {
      setSaveStatus({ loading: true, message: '', error: '' });
      const payload = {
        name: userInfo.name,
        email: userInfo.email,
        username: userInfo.username,
        phone: userInfo.phone,
        department: userInfo.department,
      };
      const res = await API.put('/auth/profile', payload);
      const updated = res.data?.user;
      if (updated) {
        const resolvedProfileImage = updated.profileImage ? resolveAvatarUrl(updated.profileImage) : null;
        setUserInfo(prev => ({
          ...prev,
          name: updated.name,
          email: updated.email,
          username: updated.username,
          role: updated.role,
          phone: updated.phone || '',
          department: updated.department || '',
          profileImage: resolvedProfileImage || prev.profileImage,
        }));
        if (resolvedProfileImage) {
          try {
            localStorage.setItem('userProfileImage', resolvedProfileImage);
            window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: { profileImage: resolvedProfileImage } }));
          } catch (e) {
            console.warn('Could not persist profile image to localStorage', e);
          }
        }
      }
      setSaveStatus({ loading: false, message: 'Settings saved successfully!', error: '' });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to save profile';
      setSaveStatus({ loading: false, message: '', error: msg });
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'security', name: 'Security', icon: '🔒' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Role-aware navbar */}
      {(() => {
        const role = (userInfo.role || localStorage.getItem('role') || '').toLowerCase();
        if (role === 'team member') return <Navbart />;
        if (role === 'owner') return <OwnerNavbar />;
        // admin and manager use Navbarm; it's role-aware for Admin Home & User Management
        return <Navbarm />;
      })()}
      
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border">
              <nav className="space-y-1 p-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-3 text-lg">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                    {loading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading user data...</span>
                      </div>
                    ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Avatar uploader embedded in Profile */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                        <div className="flex items-start gap-6">
                          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border flex items-center justify-center">
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-gray-400 text-sm">No Image</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              onChange={onAvatarFileChange}
                              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                            />
                            {avatarError && (
                              <p className="text-sm text-red-600 mt-2">{avatarError}</p>
                            )}
                            <div className="mt-3">
                              <button
                                onClick={uploadAvatar}
                                disabled={avatarUploading}
                                className={`px-4 py-2 rounded-lg text-white ${avatarUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
                              >
                                {avatarUploading ? 'Uploading...' : 'Upload Image'}
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">PNG, JPG, or WEBP up to 2MB.</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={userInfo.name}
                          onChange={(e) => handleUserInfoChange('name', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={userInfo.email}
                          onChange={(e) => handleUserInfoChange('email', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your email"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={userInfo.username}
                          onChange={(e) => handleUserInfoChange('username', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your username"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={userInfo.phone}
                          onChange={(e) => handleUserInfoChange('phone', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          value={userInfo.department}
                          onChange={(e) => handleUserInfoChange('department', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your department"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <input
                          type="text"
                          value={userInfo.role}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-sm text-gray-500 mt-1">Role cannot be changed. Contact administrator if needed.</p>
                      </div>
                    </div>
                    )}
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                    <div className="space-y-6">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-3">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                              {key === 'campaignUpdates' && 'Get notified about campaign status changes'}
                              {key === 'systemAlerts' && 'Receive system maintenance and security alerts'}
                              {key === 'weeklyReports' && 'Get weekly performance and analytics reports'}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handleNotificationChange(key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (minutes)
                        </label>
                        <select
                          value={security.sessionTimeout}
                          onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="120">2 hours</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password Expiry (days)
                        </label>
                        <select
                          value={security.passwordExpiry}
                          onChange={(e) => handleSecurityChange('passwordExpiry', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="30">30 days</option>
                          <option value="60">60 days</option>
                          <option value="90">90 days</option>
                          <option value="never">Never</option>
                        </select>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <Link
                          to="/changepass"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Change Password
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Removed standalone Profile Image tab; integrated into Profile */}

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  {saveStatus.error && (
                    <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                      {saveStatus.error}
                    </div>
                  )}
                  {saveStatus.message && (
                    <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                      {saveStatus.message}
                    </div>
                  )}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saveStatus.loading}
                      className={`px-6 py-2 text-white rounded-lg transition-colors ${saveStatus.loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {saveStatus.loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;