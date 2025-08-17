import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSettings, FiLogOut, FiEdit3, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName: user?.displayName || '',
    phone: user?.phone || '',
    location: user?.location || ''
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      displayName: user?.displayName || '',
      phone: user?.phone || '',
      location: user?.location || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      displayName: user?.displayName || '',
      phone: user?.phone || '',
      location: user?.location || ''
    });
  };

  const handleSave = async () => {
    try {
      // Update profile logic would go here
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be authenticated to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <div className="text-sm text-gray-500">
              Welcome back, {user.displayName || user.email}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Information */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={editData.displayName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiUser className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Display Name</p>
                    <p className="text-gray-900">{user.displayName || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiMail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiPhone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">{user.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FiMapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-gray-900">{user.location || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Account Actions</h3>
          </div>
          
          <div className="p-6 space-y-3">
            {user?.role === 'super_admin' && (
              <button
                onClick={() => window.location.href = '/admin'}
                className="w-full flex items-center justify-between p-3 text-left border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-purple-600"
              >
                <div className="flex items-center gap-3">
                  <FiShield className="w-5 h-5" />
                  <span>Super Admin Panel</span>
                </div>
                <FiEdit3 className="w-4 h-4 text-purple-400" />
              </button>
            )}
            
            {user?.role === 'admin' && (
              <button
                onClick={() => window.location.href = '/admin'}
                className="w-full flex items-center justify-between p-3 text-left border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-blue-600"
              >
                <div className="flex items-center gap-3">
                  <FiSettings className="w-5 h-5" />
                  <span>Admin Panel</span>
                </div>
                <FiEdit3 className="w-4 h-4 text-blue-400" />
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-3 text-left border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600"
            >
              <div className="flex items-center gap-3">
                <FiLogOut className="w-5 h-5" />
                <span>Logout</span>
              </div>
              <FiEdit3 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
