import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, setDoc, deleteDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const PendingCanteensPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingCanteens, setPendingCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Check if current user is super admin
  useEffect(() => {
    if (user && user.email !== 'vakderohit@gmail.com') {
      toast.error('Access denied. Only super admin can access this page.');
      navigate('/admin-firebase');
    }
  }, [user, navigate]);

  // Fetch pending canteens
  useEffect(() => {
    if (user?.email === 'vakderohit@gmail.com') {
      fetchPendingCanteens();
    }
  }, [user]);

  const fetchPendingCanteens = async () => {
    try {
      const q = query(collection(db, 'pendingCanteens'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const canteens = [];
      querySnapshot.forEach((doc) => {
        canteens.push({ id: doc.id, ...doc.data() });
      });
      setPendingCanteens(canteens);
    } catch (error) {
      console.error('Error fetching pending canteens:', error);
      toast.error('Failed to fetch pending canteens');
    } finally {
      setLoading(false);
    }
  };

  const approveCanteen = async (canteenId) => {
    try {
      const canteen = pendingCanteens.find(c => c.canteenId === canteenId);
      if (!canteen) return;

      const currentTime = new Date();

      // Create confirmed canteen document
      await setDoc(doc(db, 'canteens', canteenId), {
        canteenId: canteen.canteenId,
        name: canteen.canteenName,
        location: canteen.location,
        description: canteen.description,
        openTime: canteen.openTime,
        closeTime: canteen.closeTime,
        isOpen: canteen.isOpen,
        status: 'active',
        createdAt: currentTime,
        updatedAt: currentTime
      });

      // Create staff user document (they'll use Google Sign-in)
      await setDoc(doc(db, 'users', canteen.staffEmail), {
        uid: canteen.staffEmail, // Use email as UID for Google Sign-in
        email: canteen.staffEmail,
        displayName: canteen.staffName,
        phone: canteen.staffPhone,
        role: 'admin',
        canteenId: canteenId,
        canteenName: canteen.canteenName,
        isCanteenStaff: true,
        createdAt: currentTime,
        updatedAt: currentTime
      });

      // Remove from pending
      await deleteDoc(doc(db, 'pendingCanteens', canteenId));

      toast.success(`Canteen "${canteen.canteenName}" approved successfully!`);
      fetchPendingCanteens();
    } catch (error) {
      console.error('Error approving canteen:', error);
      toast.error('Failed to approve canteen');
    }
  };

  const rejectCanteen = async (canteenId) => {
    try {
      const canteen = pendingCanteens.find(c => c.canteenId === canteenId);
      if (!canteen) return;

      // Remove from pending
      await deleteDoc(doc(db, 'pendingCanteens', canteenId));

      toast.success(`Canteen "${canteen.canteenName}" rejected`);
      fetchPendingCanteens();
    } catch (error) {
      console.error('Error rejecting canteen:', error);
      toast.error('Failed to reject canteen');
    }
  };

  const viewCanteenDetails = (canteen) => {
    setSelectedCanteen(canteen);
    setShowDetails(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending canteens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin-firebase')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Panel
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Pending Canteen Approvals</h1>
          <p className="text-gray-600 mt-2">Review and approve new canteen registrations</p>
        </div>

        {/* Pending Canteens List */}
        {pendingCanteens.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
            <p className="text-gray-600">All canteen registrations have been processed.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pendingCanteens.map((canteen) => (
              <div key={canteen.canteenId} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Building className="w-6 h-6 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">{canteen.canteenName}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{canteen.staffName} ({canteen.staffRole})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{canteen.staffEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{canteen.staffPhone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Submitted {canteen.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewCanteenDetails(canteen)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => approveCanteen(canteen.canteenId)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectCanteen(canteen.canteenId)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Canteen Details Modal */}
      {showDetails && selectedCanteen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Canteen Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Canteen Information</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p><strong>Name:</strong> {selectedCanteen.canteenName}</p>
                    <p><strong>Location:</strong> {selectedCanteen.location}</p>
                    <p><strong>Description:</strong> {selectedCanteen.description}</p>
                    <p><strong>Hours:</strong> {selectedCanteen.openTime} - {selectedCanteen.closeTime}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Staff Information</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p><strong>Name:</strong> {selectedCanteen.staffName}</p>
                    <p><strong>Email:</strong> {selectedCanteen.staffEmail}</p>
                    <p><strong>Phone:</strong> {selectedCanteen.staffPhone || 'Not provided'}</p>
                    <p><strong>Role:</strong> {selectedCanteen.staffRole}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Registration Details</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p><strong>Submitted:</strong> {selectedCanteen.createdAt?.toDate?.()?.toLocaleString() || 'Recently'}</p>
                    <p><strong>Status:</strong> <span className="text-yellow-600 font-medium">Pending Approval</span></p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    approveCanteen(selectedCanteen.canteenId);
                    setShowDetails(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Canteen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingCanteensPage;
