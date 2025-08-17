import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Store, 
  Package, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Utensils,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../firebase/config';
import { collection, doc, updateDoc, deleteDoc, addDoc, onSnapshot, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('canteens');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [canteens, setCanteens] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Form states
  const [newCanteen, setNewCanteen] = useState({
    name: '',
    location: '',
    description: '',
    phone: '',
    openTime: '08:00',
    closeTime: '18:00'
  });
  
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'main',
    image: null
  });
  
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Categories for menu items
  const categories = [
    'main', 'appetizer', 'dessert', 'beverage', 'snack'
  ];

  // Load data on component mount
  useEffect(() => {
    if (user && (user.role === 'super_admin' || user.role === 'admin')) {
      loadCanteens();
      // Load all orders for super admins
      if (user.role === 'super_admin') {
        loadAllOrders();
      }
    }
  }, [user]);

  // Load menu items and orders when canteen is selected
  useEffect(() => {
    if (selectedCanteen) {
      loadMenuItems();
      loadOrders();
    }
  }, [selectedCanteen, loadMenuItems, loadOrders]);

  // Request notification permission on component mount - using exact same logic as user side
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  // Real-time listener for new orders (for admin notifications) - using exact same pattern as user side
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return;
    }

    console.log('🚀 Setting up new orders listener for admin');
    
    // Listen for new orders without orderBy to avoid index requirement
    const newOrdersQuery = query(
      collection(db, 'orders')
    );

    const unsubscribeNewOrders = onSnapshot(newOrdersQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newOrder = { id: change.doc.id, ...change.doc.data() };
          console.log('🆕 New order detected:', newOrder);
          
          // Send admin notification for new order
          sendAdminNotification(newOrder);
        }
      });
    }, (error) => {
      console.error('Error listening for new orders:', error);
    });

    return () => {
      if (unsubscribeNewOrders) {
        unsubscribeNewOrders();
      }
    };
  }, [user]);

  // Send admin notification for new order - using exact same logic as user side
  const sendAdminNotification = (order) => {
    console.log('🔔 Attempting to send admin notification for order:', order.id);
    
    // Exact same check as user side
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.log('❌ Notifications not supported or permission not granted');
      return;
    }

    console.log('✅ Sending admin notification...');
    
    const title = '🆕 New Order Received!';
    const body = `Order #${order.id.slice(-8)} from ${order.customerName || order.userEmail} - $${(order.total || 0).toFixed(2)}`;
    
    // Exact same notification creation as user side
    try {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `new-order-${order.id}`,
        requireInteraction: true
      });
      
      console.log('✅ Admin notification sent successfully!');
      
    } catch (error) {
      console.error('❌ Error sending admin notification:', error);
    }
  };

  // Load canteens with real-time updates
  const loadCanteens = () => {
    const q = query(collection(db, 'canteens'), where('isActive', '==', true));
    return onSnapshot(q, (snapshot) => {
      const canteensData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCanteens(canteensData);
    });
  };

  // Load menu items for selected canteen
  const loadMenuItems = () => {
    if (!selectedCanteen) return;
    
    const q = query(
      collection(db, `canteens/${selectedCanteen.id}/menuItems`), 
      where('isAvailable', '==', true)
    );
    return onSnapshot(q, (snapshot) => {
      const menuData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuItems(menuData);
    });
  };

  // Load orders for selected canteen
  const loadOrders = () => {
    if (!selectedCanteen) return;
    
    const q = query(
      collection(db, 'orders'), 
      where('canteenId', '==', selectedCanteen.id),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    });
  };

  // Load all orders for super admins
  const loadAllOrders = () => {
    if (user?.role !== 'super_admin') return;
    
    const q = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    });
  };

  // Handle canteen creation
  const handleAddCanteen = async (e) => {
    e.preventDefault();
    if (!newCanteen.name || !newCanteen.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'canteens'), {
        ...newCanteen,
        createdBy: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      });
      
      setNewCanteen({
        name: '',
        location: '',
        description: '',
        phone: '',
        openTime: '08:00',
        closeTime: '18:00'
      });
      
      toast.success('Canteen created successfully!');
    } catch (error) {
      console.error('Error creating canteen:', error);
      toast.error('Failed to create canteen');
    } finally {
      setLoading(false);
    }
  };

  // Handle menu item creation
  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!newMenuItem.name || !newMenuItem.price || !selectedCanteen) {
      toast.error('Please fill in all required fields and select a canteen');
      return;
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, `canteens/${selectedCanteen.id}/menuItems`), {
        ...newMenuItem,
        price: parseFloat(newMenuItem.price),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isAvailable: true
      });
      
      setNewMenuItem({
        name: '',
        description: '',
        price: '',
        category: 'main',
        image: null
      });
      
      toast.success('Menu item added successfully!');
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };

  // Handle order status update
  const handleMarkAsReady = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'ready', updatedAt: serverTimestamp() });
      toast.success('Order marked as ready!');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleMarkAsPreparing = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'preparing', updatedAt: serverTimestamp() });
      toast.success('Order marked as preparing!');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'accepted', updatedAt: serverTimestamp() });
      toast.success('Order accepted!');
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order');
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'rejected', updatedAt: serverTimestamp() });
      toast.success('Order rejected!');
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Failed to reject order');
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'delivered', updatedAt: serverTimestamp() });
      toast.success('Order marked as delivered!');
    } catch (error) {
      console.error('Error marking as delivered:', error);
      toast.error('Failed to mark as delivered');
    }
  };

  const handleMarkAsCompleted = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'completed', updatedAt: serverTimestamp() });
      toast.success('Order marked as completed!');
    } catch (error) {
      console.error('Error marking as completed:', error);
      toast.error('Failed to mark as completed');
    }
  };

  // Handle canteen deletion
  const handleDeleteCanteen = async (canteenId) => {
    if (window.confirm('Are you sure you want to delete this canteen?')) {
      try {
        await deleteDoc(doc(db, 'canteens', canteenId));
        toast.success('Canteen deleted successfully!');
      } catch (error) {
        console.error('Error deleting canteen:', error);
        toast.error('Failed to delete canteen');
      }
    }
  };

  // Handle menu item deletion
  const handleDeleteMenuItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteDoc(doc(db, `canteens/${selectedCanteen.id}/menuItems`, itemId));
        toast.success('Menu item deleted successfully!');
      } catch (error) {
        console.error('Error deleting menu item:', error);
        toast.error('Failed to delete menu item');
      }
    }
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMenuItem(prev => ({ ...prev, image: file }));
    }
  };

  // Check if user has access
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access the admin panel</h2>
          <p className="text-gray-600">You need to be authenticated to view this page.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'super_admin' && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 mt-1">Manage canteens, menus, and orders</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome,</p>
                <p className="font-medium text-gray-900">{user?.displayName || user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'canteens', name: 'Canteens', icon: Store },
              { id: 'menu', name: 'Menu Items', icon: Utensils },
              { id: 'orders', name: 'Orders', icon: Package }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
      </div>

        {/* Tab Content */}
        {activeTab === 'canteens' && (
          <div className="space-y-6">
            {/* Add Canteen Form */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Canteen</h3>
              <form onSubmit={handleAddCanteen} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={newCanteen.name}
                    onChange={(e) => setNewCanteen(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    required
                  />
    </div>
    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              type="text"
                    value={newCanteen.location}
                    onChange={(e) => setNewCanteen(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    required
            />
          </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newCanteen.phone}
                    onChange={(e) => setNewCanteen(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
        </div>
          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newCanteen.description}
                    onChange={(e) => setNewCanteen(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
          </div>
          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Open Time</label>
                  <input
                    type="time"
                    value={newCanteen.openTime}
                    onChange={(e) => setNewCanteen(prev => ({ ...prev, openTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
          </div>
          <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
                  <input
                    type="time"
                    value={newCanteen.closeTime}
                    onChange={(e) => setNewCanteen(prev => ({ ...prev, closeTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
          </div>
                <div className="md:col-span-2">
          <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
                    {loading ? 'Creating...' : 'Create Canteen'}
          </button>
                </div>
              </form>
            </div>

            {/* Canteens List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Canteens</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {canteens.map((canteen) => (
                      <tr key={canteen.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{canteen.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{canteen.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{canteen.phone || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button
                            onClick={() => setSelectedCanteen(canteen)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
            >
                            Select
            </button>
            <button
                            onClick={() => handleDeleteCanteen(canteen.id)}
                            className="text-red-600 hover:text-red-900"
            >
                            <Trash2 className="w-4 h-4" />
            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
        </div>
      </div>
    </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            {!selectedCanteen ? (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Canteen</h3>
                <p className="text-gray-600">Please select a canteen from the Canteens tab to manage its menu items.</p>
              </div>
            ) : (
              <>
                {/* Add Menu Item Form */}
                <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Add Menu Item to {selectedCanteen.name}</h3>
        <button
                      onClick={() => setSelectedCanteen(null)}
                      className="text-gray-400 hover:text-gray-600"
        >
                      <X className="w-5 h-5" />
        </button>
      </div>
                  <form onSubmit={handleAddMenuItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={newMenuItem.name}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      />
            </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={newMenuItem.category}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                      </select>
        </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newMenuItem.price}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        required
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      />
                  </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newMenuItem.description}
                        onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      />
                </div>
                    <div className="md:col-span-2">
                  <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {loading ? 'Adding...' : 'Add Menu Item'}
                  </button>
                </div>
                  </form>
              </div>

                {/* Menu Items List */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Menu Items</h3>
            </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {menuItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              {item.imageURL ? (
                                <img src={item.imageURL} alt={item.name} className="w-12 h-12 object-cover rounded" />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <Utensils className="w-6 h-6 text-gray-400" />
        </div>
      )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{item.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.price}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleDeleteMenuItem(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
    </div>
              </>
            )}
      </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {!selectedCanteen ? (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                {user?.role === 'super_admin' ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All Orders</h3>
                    <p className="text-gray-600 mb-4">Showing all orders across all canteens.</p>
                    {orders.length > 0 && (
                      <div className="text-sm text-gray-500">
                        Total Orders: {orders.length} | 
                        Pending: {orders.filter(o => o.status === 'pending').length} | 
                        Preparing: {orders.filter(o => o.status === 'preparing').length} | 
                        Ready: {orders.filter(o => o.status === 'ready').length}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Canteen</h3>
                    <p className="text-gray-600">Please select a canteen from the Canteens tab to view its orders.</p>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Orders Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Pending</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {orders.filter(o => o.status === 'pending').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Package className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Preparing</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {orders.filter(o => o.status === 'preparing').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Ready</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {orders.filter(o => o.status === 'ready').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Utensils className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Orders List */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedCanteen ? `Orders for ${selectedCanteen.name}` : 'All Orders'}
                      </h3>
                      {selectedCanteen && (
                        <button
                          onClick={() => setSelectedCanteen(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600">Orders will appear here when customers place them.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            {!selectedCanteen && (
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Canteen</th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{order.id.slice(-8)}
                              </td>
                              {!selectedCanteen && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="max-w-xs">
                                    <p className="font-medium">{order.canteenName || 'Unknown'}</p>
                                    <p className="text-xs text-gray-400">{order.canteenLocation || 'N/A'}</p>
                                  </div>
                                </td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div>
                                  <p className="font-medium">{order.customerName || order.userEmail || 'Anonymous'}</p>
                                  {order.phone && <p className="text-xs text-gray-400">{order.phone}</p>}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="max-w-xs">
                                  {order.items?.slice(0, 2).map((item, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-1">
                                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                        {item.quantity}x
              </span>
                                      <span className="truncate">{item.name}</span>
            </div>
                                  ))}
                                  {order.items?.length > 2 && (
                                    <p className="text-xs text-gray-400">
                                      +{order.items.length - 2} more items
                                    </p>
          )}
        </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ${(order.total || 0).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.createdAt?.toDate?.()?.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                }) || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                                  order.status === 'ready' ? 'bg-green-100 text-green-800' :
                                  order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status === 'pending' ? <Clock className="w-3 h-3 mr-1" /> :
                                   order.status === 'accepted' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                                   order.status === 'preparing' ? <Package className="w-3 h-3 mr-1" /> :
                                   order.status === 'ready' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                                   order.status === 'delivered' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                                   order.status === 'completed' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                                   order.status === 'rejected' ? <XCircle className="w-3 h-3 mr-1" /> :
                                   <Clock className="w-3 h-3 mr-1" />}
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  {order.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleAcceptOrder(order.id)}
                                        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded text-xs"
                                        title="Accept Order"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        onClick={() => handleRejectOrder(order.id)}
                                        className="text-red-600 hover:text-blue-900 px-2 py-1 rounded text-xs"
                                        title="Reject Order"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {order.status === 'accepted' && (
                                    <button
                                      onClick={() => handleMarkAsPreparing(order.id)}
                                      className="text-orange-600 hover:text-orange-900 px-2 py-1 rounded text-xs"
                                      title="Mark as Preparing"
                                    >
                                      Preparing
                                    </button>
                                  )}
                                  {order.status === 'preparing' && (
                                    <button
                                      onClick={() => handleMarkAsReady(order.id)}
                                      className="text-green-600 hover:text-green-900 px-2 py-1 rounded text-xs"
                                      title="Mark as Ready"
                                    >
                                      Ready
                                    </button>
                                  )}
                                  {order.status === 'ready' && (
                                    <>
                                      <button
                                        onClick={() => handleMarkAsDelivered(order.id)}
                                        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded text-xs"
                                        title="Mark as Delivered"
                                      >
                                        Delivered
                                      </button>
                                      <button
                                        onClick={() => handleMarkAsCompleted(order.id)}
                                        className="text-green-600 hover:text-green-900 px-2 py-1 rounded text-xs"
                                        title="Mark as Completed"
                                      >
                                        Completed
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded text-xs"
                                    title="View Details"
                                  >
                                    Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
      </div>
                  )}
    </div>

                {/* Order Details Modal */}
                {selectedOrder && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Order Details #{selectedOrder.id.slice(-8)}
                        </h3>
            <button
                          onClick={() => setSelectedOrder(null)}
                          className="text-gray-400 hover:text-gray-600"
            >
                          <X className="w-5 h-5" />
            </button>
          </div>

                      <div className="space-y-4">
                        {/* Customer Info */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
                              <span className="text-gray-500">Name:</span>
                              <span className="ml-2 font-medium">{selectedOrder.customerName || 'Anonymous'}</span>
            </div>
            <div>
                              <span className="text-gray-500">Email:</span>
                              <span className="ml-2 font-medium">{selectedOrder.userEmail || 'N/A'}</span>
            </div>
                            {selectedOrder.phone && (
            <div>
                                <span className="text-gray-500">Phone:</span>
                                <span className="ml-2 font-medium">{selectedOrder.phone}</span>
            </div>
                            )}
            <div>
                              <span className="text-gray-500">Order Time:</span>
                              <span className="ml-2 font-medium">
                                {selectedOrder.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}
                              </span>
                            </div>
            </div>
          </div>

          {/* Order Items */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
            <div className="space-y-2">
                            {selectedOrder.items?.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                    {item.imageURL ? (
                                      <img src={item.imageURL} alt={item.name} className="w-full h-full object-cover rounded" />
                                    ) : (
                                      <Utensils className="w-4 h-4 text-gray-400" />
                                    )}
                                  </div>
                  <div>
                                    <p className="font-medium text-gray-900">{item.name}</p>
                                    {item.notes && (
                                      <p className="text-xs text-gray-500">Note: {item.notes}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

                        {/* Order Summary */}
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-medium text-gray-900">Total:</span>
                            <span className="text-2xl font-bold text-gray-900">
                              ${(selectedOrder.total || 0).toFixed(2)}
                            </span>
            </div>
          </div>

                        {/* Status Actions */}
                        <div className="flex space-x-2 pt-4">
                          {selectedOrder.status === 'pending' && (
                            <>
              <button
                                onClick={() => {
                                  handleAcceptOrder(selectedOrder.id);
                                  setSelectedOrder(null);
                                }}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                              >
                                Accept Order
              </button>
              <button
                                onClick={() => {
                                  handleRejectOrder(selectedOrder.id);
                                  setSelectedOrder(null);
                                }}
                                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                              >
                                Reject Order
              </button>
                            </>
            )}
                          {selectedOrder.status === 'accepted' && (
              <button
                              onClick={() => {
                                handleMarkAsPreparing(selectedOrder.id);
                                setSelectedOrder(null);
                              }}
                              className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700"
                            >
                              Mark as Preparing
              </button>
            )}
                          {selectedOrder.status === 'preparing' && (
            <button
                              onClick={() => {
                                handleMarkAsReady(selectedOrder.id);
                                setSelectedOrder(null);
                              }}
                              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                            >
                              Mark as Ready
            </button>
                          )}
                          {selectedOrder.status === 'ready' && (
            <button
                              onClick={() => {
                                handleMarkAsDelivered(selectedOrder.id);
                                setSelectedOrder(null);
                              }}
                              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                            >
                              Mark as Delivered
            </button>
                          )}
                          {selectedOrder.status === 'ready' && (
            <button
                              onClick={() => {
                                handleMarkAsCompleted(selectedOrder.id);
                                setSelectedOrder(null);
                              }}
                              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                            >
                              Mark as Completed
            </button>
                          )}
          </div>
        </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
