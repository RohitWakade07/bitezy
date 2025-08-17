import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Utensils, 
  Store, 
  Package,
  Upload,
  X,
  Users,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const FirebaseTest = () => {
  const { user } = useAuth();
  const [canteens, setCanteens] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newCanteen, setNewCanteen] = useState({
    name: '',
    location: '',
    description: '',
    phone: ''
  });

  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'main'
  });

  const [newOrder, setNewOrder] = useState({
    customerName: '',
    items: [],
    total: 0
  });

  // Load data with real-time updates
  useEffect(() => {
    const unsubscribeCanteens = onSnapshot(collection(db, 'canteens'), (snapshot) => {
      setCanteens(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      console.log('🔄 Canteens updated:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeCanteens();
    };
  }, []);

  useEffect(() => {
    if (!selectedCanteen) return;

    const unsubscribeMenu = onSnapshot(query(collection(db, 'menuItems'), where('canteenId', '==', selectedCanteen.id)), (snapshot) => {
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      console.log('🔄 Menu items updated:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeOrders = onSnapshot(query(collection(db, 'orders'), where('canteenId', '==', selectedCanteen.id)), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      console.log('🔄 Orders updated:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeMenu();
      unsubscribeOrders();
    };
  }, [selectedCanteen]);

  // Test canteen creation
  const handleCreateCanteen = async (e) => {
    e.preventDefault();
    if (!newCanteen.name || !newCanteen.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const canteenRef = await addDoc(collection(db, 'canteens'), {
        ...newCanteen,
        createdBy: user.email,
        createdAt: serverTimestamp()
      });
      
      toast.success(`Canteen "${newCanteen.name}" created successfully!`);
      setNewCanteen({ name: '', location: '', description: '', phone: '' });
      
      console.log('✅ Canteen created with ID:', canteenRef.id);
    } catch (error) {
      console.error('❌ Error creating canteen:', error);
      toast.error('Failed to create canteen');
    } finally {
      setLoading(false);
    }
  };

  // Test menu item creation
  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    if (!newMenuItem.name || !newMenuItem.price || !selectedCanteen) {
      toast.error('Please fill in all required fields and select a canteen');
      return;
    }

    setLoading(true);
    try {
      const itemRef = await addDoc(collection(db, 'menuItems'), {
        ...newMenuItem,
        price: parseFloat(newMenuItem.price),
        canteenId: selectedCanteen.id,
        createdAt: serverTimestamp()
      });
      
      toast.success(`Menu item "${newMenuItem.name}" added successfully!`);
      setNewMenuItem({ name: '', description: '', price: '', category: 'main' });
      
      console.log('✅ Menu item created with ID:', itemRef.id);
    } catch (error) {
      console.error('❌ Error creating menu item:', error);
      toast.error('Failed to create menu item');
    } finally {
      setLoading(false);
    }
  };

  // Test order creation
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.customerName || newOrder.items.length === 0) {
      toast.error('Please fill in customer name and add items');
      return;
    }

    setLoading(true);
    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        ...newOrder,
        canteenId: selectedCanteen.id,
        canteenName: selectedCanteen.name,
        createdAt: serverTimestamp()
      });
      
      toast.success(`Order created successfully!`);
      setNewOrder({ customerName: '', items: [], total: 0 });
      
      console.log('✅ Order created with ID:', orderRef.id);
    } catch (error) {
      console.error('❌ Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  // Test order status update
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: status, updatedAt: serverTimestamp() });
      toast.success(`Order status updated to ${status}`);
      console.log('✅ Order status updated:', orderId, status);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Add item to order
  const addItemToOrder = (menuItem) => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { ...menuItem, quantity: 1 }],
      total: prev.total + parseFloat(menuItem.price)
    }));
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Please log in to test Firebase functionality</h2>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Firebase Test Dashboard</h1>
        <p className="text-gray-600">Test real-time Firebase functionality</p>
      </div>

      {/* Canteen Creation Test */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Store className="w-5 h-5" />
          Test Canteen Creation
        </h2>
        <form onSubmit={handleCreateCanteen} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={newCanteen.name}
              onChange={(e) => setNewCanteen(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Test Canteen"
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
              placeholder="Test Location"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={newCanteen.description}
              onChange={(e) => setNewCanteen(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Test Description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={newCanteen.phone}
              onChange={(e) => setNewCanteen(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="123-456-7890"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Test Canteen'}
            </button>
          </div>
        </form>
      </div>

      {/* Canteens List */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Available Canteens</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {canteens.map((canteen) => (
            <div
              key={canteen.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedCanteen?.id === canteen.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedCanteen(canteen)}
            >
              <h3 className="font-semibold text-gray-900">{canteen.name}</h3>
              <p className="text-sm text-gray-600">{canteen.location}</p>
              <p className="text-xs text-gray-500 mt-1">
                Created: {canteen.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Item Creation Test */}
      {selectedCanteen && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Test Menu Item Creation for {selectedCanteen.name}
          </h2>
          <form onSubmit={handleCreateMenuItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={newMenuItem.name}
                onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Test Item"
                required
              />
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
                placeholder="9.99"
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
                <option value="main">Main</option>
                <option value="appetizer">Appetizer</option>
                <option value="dessert">Dessert</option>
                <option value="beverage">Beverage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={newMenuItem.description}
                onChange={(e) => setNewMenuItem(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Test description"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Test Menu Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Items List */}
      {selectedCanteen && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Menu Items for {selectedCanteen.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                <p className="text-lg font-bold text-green-600">${item.price}</p>
                <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                <button
                  onClick={() => addItemToOrder(item)}
                  className="mt-2 w-full bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700"
                >
                  Add to Order
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Creation Test */}
      {selectedCanteen && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Test Order Creation
          </h2>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
              <input
                type="text"
                value={newOrder.customerName}
                onChange={(e) => setNewOrder(prev => ({ ...prev, customerName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Test Customer"
                required
              />
            </div>
            
            {newOrder.items.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
                <div className="space-y-2">
                  {newOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{item.name}</span>
                      <span className="font-semibold">${item.price}</span>
                    </div>
                  ))}
                </div>
                <p className="text-right mt-2 font-bold">Total: ${newOrder.total.toFixed(2)}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || newOrder.items.length === 0}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Test Order'}
            </button>
          </form>
        </div>
      )}

      {/* Orders List */}
      {selectedCanteen && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Orders for {selectedCanteen.name}</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Customer: {order.customerName || 'Anonymous'}</p>
                <p className="text-sm text-gray-600">Total: ${order.total || 0}</p>
                <p className="text-xs text-gray-500">
                  Created: {order.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}
                </p>
                
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                    className="mt-2 bg-green-600 text-white py-1 px-3 rounded text-sm hover:bg-green-700"
                  >
                    Mark as Ready
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Updates Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Real-time Updates Active</h3>
        <p className="text-blue-800 text-sm">
          This dashboard shows real-time updates from Firebase. Any changes made in the admin panel 
          or other parts of the app will automatically appear here without refreshing the page.
        </p>
        <div className="mt-3 text-xs text-blue-700">
          <p>• Canteens: {canteens.length} available</p>
          <p>• Menu Items: {menuItems.length} available</p>
          <p>• Orders: {orders.length} total</p>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest;
