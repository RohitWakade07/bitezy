import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FiPackage, FiUsers, FiDollarSign, FiTrendingUp, FiClock, 
  FiCheckCircle, FiXCircle, FiEdit3, FiTrash2, FiPlus,
  FiFilter, FiSearch, FiRefreshCw, FiEye, FiEyeOff, FiSettings,
  FiCalendar, FiMapPin, FiPhone, FiMail, FiBell, FiToggleRight,
  FiToggleLeft, FiSave, FiX, FiChevronDown, FiChevronUp
} from 'react-icons/fi';

const CanteenAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get staff token from localStorage
  const staffToken = localStorage.getItem('canteenStaffToken');

  // Check if staff is authenticated
  useEffect(() => {
    if (!staffToken) {
      window.location.href = '/canteen-login';
      toast.error('Please login to access canteen admin panel');
    }
  }, [staffToken]);

  // Fetch canteen staff profile and settings
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState(null);

  // Extract canteenSettings and staff from settings for use in render
  const canteenSettings = settings?.canteenSettings;
  const staff = settings?.staff;

  useEffect(() => {
    async function fetchSettings() {
      if (!staffToken) return;
      
      setSettingsLoading(true);
      try {
        const response = await axios.get('/api/canteen-auth/me', {
          headers: {
            'Authorization': `Bearer ${staffToken}`
          }
        });
        setSettings(response.data);
        setSettingsError(null);
      } catch (err) {
        console.error('Settings fetch error:', err);
        setSettingsError('Failed to fetch settings');
        if (err.response?.status === 401) {
          localStorage.removeItem('canteenStaffToken');
          window.location.href = '/canteen-login';
        }
      } finally {
        setSettingsLoading(false);
      }
    }
    fetchSettings();
  }, [staffToken]);

  // Announcements are now part of canteen settings
  const announcements = canteenSettings?.specialAnnouncements || [];

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!staffToken || !staff?.canteenId) return;
      
      setOrdersLoading(true);
      try {
        const response = await axios.get(`/api/orders?canteenId=${staff.canteenId}&status=${filterStatus}&search=${searchQuery}`, {
          headers: {
            'Authorization': `Bearer ${staffToken}`
          }
        });
        setOrders(response.data);
        setOrdersError(null);
      } catch (err) {
        console.error('Orders fetch error:', err);
        setOrdersError('Failed to fetch orders');
        if (err.response?.status === 401) {
          localStorage.removeItem('canteenStaffToken');
          window.location.href = '/canteen-login';
        }
      } finally {
        setOrdersLoading(false);
      }
    }
    fetchOrders();
  }, [staffToken, staff?.canteenId, filterStatus, searchQuery]);

  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState(null);

  useEffect(() => {
    async function fetchMenu() {
      if (!staffToken || !staff?.canteenId) return;
      
      setMenuLoading(true);
      try {
        const response = await axios.get(`/api/menu?canteenId=${staff.canteenId}`, {
          headers: {
            'Authorization': `Bearer ${staffToken}`
          }
        });
        setMenuItems(response.data);
        setMenuError(null);
      } catch (err) {
        console.error('Menu fetch error:', err);
        setMenuError('Failed to fetch menu items');
        if (err.response?.status === 401) {
          localStorage.removeItem('canteenStaffToken');
          window.location.href = '/canteen-login';
        }
      } finally {
        setMenuLoading(false);
      }
    }
    fetchMenu();
  }, [staffToken, staff?.canteenId]);

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`/api/orders/${orderId}/status`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${staffToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Order status updated successfully!');
        // Refresh orders
        const ordersResponse = await axios.get(`/api/orders?canteenId=${staff.canteenId}&status=${filterStatus}&search=${searchQuery}`, {
          headers: {
            'Authorization': `Bearer ${staffToken}`
          }
        });
        setOrders(ordersResponse.data);
      } else {
        toast.error(response.data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Order status update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
      if (error.response?.status === 401) {
        localStorage.removeItem('canteenStaffToken');
        window.location.href = '/canteen-login';
      }
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  // Ensure orders is always an array before filtering
  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{canteenSettings?.canteenName || 'Canteen Admin'}</h1>
              <p className="text-sm text-gray-600">Welcome back, {staff?.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettingsModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FiSettings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('canteenStaffToken');
                  window.location.href = '/canteen-login';
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-shrink-0 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-shrink-0 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-shrink-0 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'menu'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Menu Management
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`flex-shrink-0 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'announcements'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Announcements
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {activeTab === 'dashboard' && (
          <DashboardTab 
            staff={settings?.staff} 
            canteenSettings={settings?.canteenSettings} 
            orders={orders}
            onOpenSettings={() => setShowSettingsModal(true)}
            isLoading={settingsLoading}
            error={settingsError}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            orders={filteredOrders}
            isLoading={ordersLoading}
            error={ordersError}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onViewOrder={handleViewOrder}
            onUpdateStatus={handleOrderStatusUpdate}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />
        )}

        {activeTab === 'menu' && (
          <MenuTab
            menuItems={menuItems}
            isLoading={menuLoading}
            error={menuError}
            canteenId={staff?.canteenId}
          />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsTab
            announcements={announcements}
            isLoading={settingsLoading}
            error={settingsError}
            onAddAnnouncement={() => setShowAnnouncementModal(true)}
          />
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setShowOrderModal(false)}
          onUpdateStatus={handleOrderStatusUpdate}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          canteenSettings={settings?.canteenSettings}
          onClose={() => setShowSettingsModal(false)}
          onSave={async (data) => {
            try {
              setSettingsLoading(true);
              await axios.put(`${process.env.REACT_APP_API_URL}/admin/settings`, data);
              setSettings({ ...settings, canteenSettings: data });
            } catch (err) {
              setSettingsError('Failed to save settings');
            } finally {
              setSettingsLoading(false);
              setShowSettingsModal(false);
            }
          }}
          isLoading={settingsLoading}
        />
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <AnnouncementModal
          onClose={() => setShowAnnouncementModal(false)}
          onSave={(data) => {
            console.log('Adding announcement:', data);
            setShowAnnouncementModal(false);
          }}
          isLoading={false}
        />
      )}
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab = ({ staff, canteenSettings, orders, onOpenSettings }) => {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const totalOrders = safeOrders.length;
  const pendingOrders = safeOrders.filter(order => order.status === 'pending').length;
  const totalRevenue = safeOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const isOpen = canteenSettings?.isCurrentlyOpen?.() || false;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <FiClock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-800">{pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${isOpen ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className={`w-6 h-6 ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {isOpen ? <FiToggleRight /> : <FiToggleLeft />}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={`text-lg font-bold ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                {isOpen ? 'Open' : 'Closed'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Canteen Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Canteen Information</h2>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiEdit3 className="w-3 h-3" />
            Edit
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiMail className="w-4 h-4" />
                <span>{canteenSettings?.contactInfo?.email || 'Not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiPhone className="w-4 h-4" />
                <span>{canteenSettings?.contactInfo?.phone || 'Not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiMapPin className="w-4 h-4" />
                <span>{canteenSettings?.contactInfo?.address || 'Not set'}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Operating Hours</h3>
            <div className="space-y-1">
              {canteenSettings?.operatingHours?.map((hours, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="capitalize text-gray-600">{hours.day}</span>
                  <span className="text-gray-800">
                    {hours.open === 'Closed' ? 'Closed' : `${hours.open} - ${hours.close}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h2>
        {orders && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">#{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{order.customer.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">${order.total.toFixed(2)}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'ready' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent orders</p>
        )}
      </div>
    </div>
  );
};

// Orders Tab Component
const OrdersTab = ({ orders, isLoading, filterStatus, setFilterStatus, searchQuery, setSearchQuery, onViewOrder, onUpdateStatus, getStatusColor, getStatusText }) => {
  const statusOptions = ['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search orders by customer name or order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : getStatusText(status)}
                </option>
              ))}
            </select>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onView={onViewOrder}
              onUpdateStatus={onUpdateStatus}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No menu items</h3>
          <p className="text-gray-600">Start by adding your first menu item.</p>
        </div>
      )}
    </div>
  );
};

// Announcements Tab Component
const AnnouncementsTab = ({ announcements, isLoading, error, onAddAnnouncement }) => {
  const activeAnnouncements = announcements?.filter(a => a.isActive) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Announcements</h2>
        <button
          onClick={onAddAnnouncement}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Add Announcement
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h3>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{error}</h3>
        </div>
      ) : activeAnnouncements.length > 0 ? (
        <div className="space-y-4">
          {activeAnnouncements.map((announcement) => (
            <div key={announcement._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-2">{announcement.title}</h3>
                  <p className="text-gray-600 mb-3">{announcement.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Start: {new Date(announcement.startDate).toLocaleDateString()}</span>
                    {announcement.endDate && (
                      <span>End: {new Date(announcement.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <FiEdit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No announcements</h3>
          <p className="text-gray-600">Create your first announcement to keep customers informed.</p>
        </div>
      )}
    </div>
  );
};

// Order Detail Modal Component
const OrderDetailModal = ({ order, onClose, onUpdateStatus, getStatusColor, getStatusText }) => {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm text-gray-500">Order Number</span>
              <p className="font-medium text-gray-800">#{order.orderNumber}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-500">Customer</span>
              <p className="font-medium text-gray-800">{order.customer.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Phone</span>
              <p className="font-medium text-gray-800">{order.customer.phone}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800">Total ({totalItems} items)</span>
              <span className="text-xl font-bold text-gray-800">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {order.status === 'pending' && (
              <button
                onClick={() => onUpdateStatus(order._id, 'confirmed')}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Confirm Order
              </button>
            )}
            
            {order.status === 'confirmed' && (
              <button
                onClick={() => onUpdateStatus(order._id, 'preparing')}
                className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Start Preparing
              </button>
            )}
            
            {order.status === 'preparing' && (
              <button
                onClick={() => onUpdateStatus(order._id, 'ready')}
                className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Mark Ready
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Modal Component
const SettingsModal = ({ canteenSettings, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    canteenName: canteenSettings?.canteenName || '',
    description: canteenSettings?.description || '',
    contactInfo: {
      phone: canteenSettings?.contactInfo?.phone || '',
      email: canteenSettings?.contactInfo?.email || '',
      address: canteenSettings?.contactInfo?.address || ''
    },
    operatingHours: canteenSettings?.operatingHours || [
      { day: 'monday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
      { day: 'tuesday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
      { day: 'wednesday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
      { day: 'thursday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
      { day: 'friday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
      { day: 'saturday', isOpen: true, openTime: '10:00', closeTime: '18:00' },
      { day: 'sunday', isOpen: false, openTime: '', closeTime: '' }
    ]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateOperatingHours = (dayIndex, field, value) => {
    const updatedHours = [...formData.operatingHours];
    updatedHours[dayIndex] = { ...updatedHours[dayIndex], [field]: value };
    setFormData({ ...formData, operatingHours: updatedHours });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Canteen Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Canteen Name
                  </label>
                  <input
                    type="text"
                    value={formData.canteenName}
                    onChange={(e) => setFormData({ ...formData, canteenName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.contactInfo.phone}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      contactInfo: { ...formData.contactInfo, phone: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      contactInfo: { ...formData.contactInfo, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.contactInfo.address}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    contactInfo: { ...formData.contactInfo, address: e.target.value }
                  })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Operating Hours</h3>
              <div className="space-y-3">
                {formData.operatingHours.map((dayHours, index) => (
                  <div key={dayHours.day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-24">
                      <span className="capitalize font-medium text-gray-700">{dayHours.day}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={dayHours.isOpen}
                        onChange={(e) => updateOperatingHours(index, 'isOpen', e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <label className="text-sm text-gray-600">Open</label>
                    </div>
                    
                    {dayHours.isOpen && (
                      <>
                        <div>
                          <input
                            type="time"
                            value={dayHours.openTime}
                            onChange={(e) => updateOperatingHours(index, 'openTime', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <span className="text-gray-500">to</span>
                        <div>
                          <input
                            type="time"
                            value={dayHours.closeTime}
                            onChange={(e) => updateOperatingHours(index, 'closeTime', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <FiSave className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Announcement Modal Component
const AnnouncementModal = ({ onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Add Announcement</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="Enter announcement title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="Enter announcement message"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-blue-600"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Make this announcement active immediately
              </label>
            </div>

            <div className="flex gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <FiPlus className="w-4 h-4" />
                Add Announcement
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CanteenAdminPanel;

// Order Card Component
const OrderCard = ({ order, onView, onUpdateStatus, getStatusColor, getStatusText }) => {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
            <span className="text-sm text-gray-500">#{order.orderNumber}</span>
          </div>
          <span className="text-sm font-medium text-gray-800">${order.total.toFixed(2)}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div>
            <span className="text-xs text-gray-500">Customer</span>
            <p className="text-sm font-medium text-gray-800">{order.customer.name}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Items</span>
            <p className="text-sm font-medium text-gray-800">{totalItems} items</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Time</span>
            <p className="text-sm font-medium text-gray-800">
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onView(order)}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            View Details
          </button>
          
          {order.status === 'pending' && (
            <button
              onClick={() => onUpdateStatus(order._id, 'confirmed')}
              className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Confirm
            </button>
          )}
          
          {order.status === 'confirmed' && (
            <button
              onClick={() => onUpdateStatus(order._id, 'preparing')}
              className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              Start Preparing
            </button>
          )}
          
          {order.status === 'preparing' && (
            <button
              onClick={() => onUpdateStatus(order._id, 'ready')}
              className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              Mark Ready
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Menu Tab Component
const MenuTab = ({ menuItems, isLoading, error, canteenId }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Menu Management</h2>
        <button
          onClick={() => console.log('Add new menu item')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{error}</h3>
        </div>
      ) : menuItems && menuItems.length > 0 ? (
        <div className="space-y-4">
          {menuItems.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-gray-400">🍽️</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-sm font-medium text-gray-800">${item.price}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => console.log('Edit item:', item._id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FiEdit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this menu item?')) {
                        console.log('Delete item:', item._id);
                      }
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No menu items</h3>
          <p className="text-gray-600">Start by adding your first menu item.</p>
        </div>
      )}
    </div>
  );
};

