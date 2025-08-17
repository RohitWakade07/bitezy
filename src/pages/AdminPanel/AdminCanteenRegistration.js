import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  Plus,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCanteenRegistration = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    canteenName: '',
    canteenLocation: '',
    canteenPhone: '',
    staffName: '',
    staffEmail: '',
    staffPhone: ''
  });

  // Check if current user is super admin
  useEffect(() => {
    if (user && user.email !== 'vakderohit@gmail.com') {
      toast.error('Access denied. Only super admin can register canteens.');
      navigate('/admin-firebase');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateCanteenId = () => {
    return 'CANT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const generateStaffId = () => {
    return 'STAFF_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    
    setLoading(true);
    try {
      const canteenId = generateCanteenId();
      const currentTime = new Date();

      // Create canteen document in Firestore
      await setDoc(doc(db, "canteens", canteenId), {
        canteenId,
        name: formData.canteenName,
        location: formData.canteenLocation,
        phone: formData.canteenPhone,
        createdAt: currentTime,
        updatedAt: currentTime,
        isActive: true,
        registeredBy: user.email,
        registeredAt: currentTime
      });

      // Create canteen staff user document in Firestore (for Google Sign-in)
      await setDoc(doc(db, "users", formData.staffEmail), {
        uid: formData.staffEmail, // Use email as UID for Google Sign-in compatibility
        email: formData.staffEmail,
        displayName: formData.staffName,
        phone: formData.staffPhone,
        role: 'admin', // Canteen users become admins
        canteenId: canteenId,
        canteenName: formData.canteenName,
        createdAt: currentTime,
        updatedAt: currentTime,
        isCanteenStaff: true
      });

      toast.success(`Canteen "${formData.canteenName}" registered successfully!`);
      toast.success(`Staff can now login using Google Sign-in with ${formData.staffEmail}`);
      
      // Reset form
      setFormData({
        canteenName: '',
        canteenLocation: '',
        canteenPhone: '',
        staffName: '',
        staffEmail: '',
        staffPhone: ''
      });

    } catch (error) {
      console.error('Error registering canteen:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Staff email already exists. Please use a different email.');
      } else {
        toast.error('Failed to register canteen: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.email !== 'vakderohit@gmail.com') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only super admin can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin-firebase')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Panel
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Register New Canteen</h1>
          <p className="text-gray-600 mt-2">Create new canteen accounts for staff members</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Canteen Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Canteen Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Canteen Name *
                  </label>
                                     <input
                     type="text"
                     name="canteenName"
                     value={formData.canteenName}
                     onChange={handleChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                     placeholder="Enter canteen name"
                     required
                   />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                                     <input
                     type="text"
                     name="canteenLocation"
                     value={formData.canteenLocation}
                     onChange={handleChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                     placeholder="Enter location"
                     required
                   />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                                     <input
                     type="tel"
                     name="canteenPhone"
                     value={formData.canteenPhone}
                     onChange={handleChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                     placeholder="Enter phone number"
                   />
                </div>
              </div>
            </div>

            {/* Staff Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Staff Account Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Name *
                  </label>
                                     <input
                     type="text"
                     name="staffName"
                     value={formData.staffName}
                     onChange={handleChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                     placeholder="Enter staff name"
                     required
                   />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Email *
                  </label>
                                     <input
                     type="email"
                     name="staffEmail"
                     value={formData.staffEmail}
                     onChange={handleChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                     placeholder="Enter staff email"
                     required
                   />
                </div>
                
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Staff Phone
                   </label>
                   <input
                     type="tel"
                     name="staffPhone"
                     value={formData.staffPhone}
                     onChange={handleChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                     placeholder="Enter staff phone"
                   />
                 </div>
                 

               </div>
             </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {loading ? 'Registering...' : 'Register Canteen'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Important Notes:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Canteen staff will be automatically assigned admin role</li>
            <li>• Staff accounts are created for Google Sign-in access</li>
            <li>• Staff can immediately login at /canteen-login using Google</li>
            <li>• Each canteen gets a unique ID for tracking</li>
            <li>• Staff can manage their canteen's menu and orders</li>
          </ul>
        </div>

        {/* Login Instructions */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 mb-2">Staff Access:</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>✅ Staff account created for Google Sign-in</li>
            <li>✅ Staff can login immediately at /canteen-login</li>
            <li>✅ Staff will have access to canteen dashboard</li>
            <li>✅ Staff can manage menu items and orders</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminCanteenRegistration;
