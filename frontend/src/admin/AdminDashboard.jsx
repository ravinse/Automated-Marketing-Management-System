import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbarm from '../Marketingmanager/Navbarm';
import API from '../api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  // Dashboard statistics from API
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersByRole: {
      admin: 0,
      manager: 0,
      'team member': 0,
      owner: 0
    },
    campaigns: {
      running: 0,
      'pending approval': 0,
      draft: 0,
      approved: 0,
      completed: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========================================
  // ADMIN ACCESS VERIFICATION
  // ========================================
  // Verify user is admin before loading dashboard
  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        const response = await API.get('/auth/profile');
        if (response.data.role !== 'admin') {
          alert('Access denied. Admin privileges required.');
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Failed to verify admin access:', error);
        alert('Authentication failed. Please log in.');
        navigate('/login');
        return;
      }
    };
    
    verifyAdminAccess();
  }, [navigate]);

  // ========================================
  // DATA FETCHING
  // ========================================
  // Fetch dashboard statistics from backend on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        let totalUsers = 0;
        let usersByRole = {};
        let campaignsByStatus = {};

        // Fetch users data (may fail if not admin)
        try {
          const usersResponse = await API.get('/users');
          const users = usersResponse.data;

          // Calculate user statistics
          totalUsers = users.length;
          usersByRole = users.reduce((acc, user) => {
            const role = user.role || 'team member';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
          }, {});
        } catch (userError) {
          console.error('Failed to fetch users:', userError);
          // If user endpoint fails, continue without user data
          if (userError.response?.status === 403 || userError.response?.status === 401) {
            setError('Authentication required. Please log in as admin.');
            setLoading(false);
            return;
          }
        }

        // Fetch campaigns data
        try {
          const campaignsResponse = await API.get('/campaigns');
          const campaigns = campaignsResponse.data.campaigns || campaignsResponse.data || [];

          // Calculate campaign statistics by status
          campaignsByStatus = campaigns.reduce((acc, campaign) => {
            const status = campaign.status || 'draft';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});
        } catch (campaignError) {
          console.error('Failed to fetch campaigns:', campaignError);
          // Continue without campaign data
        }

        // Update state with fetched data
        setStats({
          totalUsers,
          usersByRole,
          campaigns: campaignsByStatus
        });

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ========================================
  // COMPONENTS
  // ========================================
  // Simple Card component for displaying stats
  const Card = ({ title, value, loading }) => (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-gray-500 font-medium">{title}</h3>
      {loading ? (
        <div className="mt-2 h-9 bg-gray-200 animate-pulse rounded"></div>
      ) : (
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <Navbarm />

      {/* Main Dashboard Content */}
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
            <p className="text-sm mt-2">Check browser console for more details.</p>
          </div>
        )}

        {/* System Overview Section - Display total users */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">System Overview</h2>
          <Card title="Total System Users" value={stats.totalUsers} loading={loading} />
        </div>

        {/* User Roles Breakdown - Show count per role type */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">User Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <Card title="Admins" value={stats.usersByRole.admin || 0} loading={loading} />
            <Card title="Managers" value={stats.usersByRole.manager || 0} loading={loading} />
            <Card title="Team Members" value={stats.usersByRole['team member'] || 0} loading={loading} />
            <Card title="Owners" value={stats.usersByRole.owner || 0} loading={loading} />
          </div>
        </div>

        {/* Campaign Status - All campaigns overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Campaign Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card title="Running" value={stats.campaigns.running || 0} loading={loading} />
            <Card title="Pending Approval" value={stats.campaigns['pending approval'] || 0} loading={loading} />
            <Card title="Approved" value={stats.campaigns.approved || 0} loading={loading} />
            <Card title="Draft" value={stats.campaigns.draft || 0} loading={loading} />
            <Card title="Completed" value={stats.campaigns.completed || 0} loading={loading} />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <a
              href="/user-management"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <h3 className="text-gray-500 font-medium mb-2">Manage Users</h3>
              <p className="text-gray-600 text-sm">Add, edit, or remove system users</p>
            </a>
            <a
              href="/Campaign"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <h3 className="text-gray-500 font-medium mb-2">View Campaigns</h3>
              <p className="text-gray-600 text-sm">Monitor all marketing campaigns</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
