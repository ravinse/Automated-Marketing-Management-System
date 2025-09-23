import React, { useState } from 'react';
import AdminNavbar from './AdminNavbar.jsx';

// Add New User Button Component
const AddNewUserButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
    >
      Add New User
    </button>
  );
};

// User Form Component
const UserForm = ({ isOpen, onClose, onSubmit, editUser = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'Analyst',
    status: 'Active'
  });

  // Update form data when editUser changes
  React.useEffect(() => {
    if (isEditing && editUser) {
      setFormData({
        username: editUser.username,
        email: editUser.email,
        role: editUser.role,
        status: editUser.status
      });
    } else {
      setFormData({
        username: '',
        email: '',
        role: 'Analyst',
        status: 'Active'
      });
    }
  }, [isEditing, editUser, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, isEditing ? editUser : null);
    if (!isEditing) {
      setFormData({
        username: '',
        email: '',
        role: 'Analyst',
        status: 'Active'
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isEditing} // Disable username editing
              required
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Analyst">Analyst</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isEditing ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Table Component
const UserTable = ({ users, onEditUser, onDeactivateUser, onActivateUser }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Username</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Email</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Role</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Status</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Last Login</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-4 px-6 text-sm text-gray-900">{user.username}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{user.email}</td>
                <td className="py-4 px-6 text-sm text-gray-900">{user.role}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    user.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {formatDate(user.lastLogin)}
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => onEditUser(user)}
                      className="text-blue-600 hover:text-blue-800 text-sm text-left"
                    >
                      Edit User
                    </button>
                    {user.status === 'Active' ? (
                      <button
                        onClick={() => onDeactivateUser(user)}
                        className="text-red-600 hover:text-red-800 text-sm text-left"
                      >
                        Deactivate User
                      </button>
                    ) : (
                      <button
                        onClick={() => onActivateUser(user)}
                        className="text-green-600 hover:text-green-800 text-sm text-left"
                      >
                        Activate User
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// User Management Component
const UserManagement = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState([
    {
      username: 'emma.smith',
      email: 'emma.smith@example.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2024-01-20T10:00:00Z'
    },
    {
      username: 'liam.jones',
      email: 'liam.jones@example.com',
      role: 'Manager',
      status: 'Active',
      lastLogin: '2024-01-19T15:30:00Z'
    },
    {
      username: 'olivia.brown',
      email: 'olivia.brown@example.com',
      role: 'Analyst',
      status: 'Inactive',
      lastLogin: '2023-12-15T09:15:00Z'
    },
    {
      username: 'noah.davis',
      email: 'noah.davis@example.com',
      role: 'Manager',
      status: 'Active',
      lastLogin: '2024-01-21T11:45:00Z'
    },
    {
      username: 'isabella.wilson',
      email: 'isabella.wilson@example.com',
      role: 'Analyst',
      status: 'Active',
      lastLogin: '2024-01-20T14:00:00Z'
    }
  ]);

  const handleAddUser = (userData, existingUser) => {
    if (isEditing && existingUser) {
      // Update existing user
      setUsers(users.map(u => 
        u.username === existingUser.username 
          ? { ...u, ...userData, lastLogin: u.lastLogin } // Keep original lastLogin for edits
          : u
      ));
    } else {
      // Add new user
      const newUser = {
        ...userData,
        lastLogin: new Date().toISOString()
      };
      setUsers([...users, newUser]);
    }
    handleCloseForm();
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setIsEditing(false);
    setEditingUser(null);
  };

  const handleAddNewUser = () => {
    setIsEditing(false);
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleDeactivateUser = (user) => {
    setUsers(users.map(u => 
      u.username === user.username 
        ? { ...u, status: 'Inactive' }
        : u
    ));
  };

  const handleActivateUser = (user) => {
    setUsers(users.map(u => 
      u.username === user.username 
        ? { ...u, status: 'Active' }
        : u
    ));
  };

  return (
    <>
      <AdminNavbar />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <AddNewUserButton onClick={handleAddNewUser} />
        </div>
      
      <UserTable 
        users={users}
        onEditUser={handleEditUser}
        onDeactivateUser={handleDeactivateUser}
        onActivateUser={handleActivateUser}
      />
      
      <UserForm 
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleAddUser}
        editUser={editingUser}
        isEditing={isEditing}
      />
      </div>
    </>
  );
};

export default UserManagement;