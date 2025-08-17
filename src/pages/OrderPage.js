import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Package, 
  CheckCircle, 
  XCircle, 
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrderPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState(new Set());
  const unsubscribeRef = useRef(null);
  const previousOrdersRef = useRef([]);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          toast.success('Notifications enabled! You\'ll get updates about your orders.');
        } else {
          toast.error('Notifications blocked. Please enable them in your browser settings.');
        }
      });
    }
  };

  // Send system notification
  const sendSystemNotification = useCallback((status, order) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    let title, body, icon;

    switch (status) {
      case 'accepted':
        title = 'Order Accepted! 🎉';
        body = `Your order #${order.id.slice(-8)} has been accepted and will be prepared soon.`;
        icon = '/favicon.ico';
        break;
      case 'preparing':
        title = 'Order in Progress! 👨‍🍳';
        body = `Chefs are preparing your delicious food for order #${order.id.slice(-8)}.`;
        icon = '/favicon.ico';
        break;
      case 'ready':
        title = 'Order Ready for Pickup! 🚀';
        body = `Your order #${order.id.slice(-8)} is ready! Come and collect it.`;
        icon = '/favicon.ico';
        break;
      case 'completed':
        title = 'Order Completed! ✅';
        body = `Thank you for your order #${order.id.slice(-8)}! We hope you enjoyed it.`;
        icon = '/favicon.ico';
        break;
      case 'rejected':
        title = 'Order Rejected ❌';
        body = `Your order #${order.id.slice(-8)} has been rejected. Please contact support.`;
        icon = '/favicon.ico';
        break;
      default:
        return;
    }

    new Notification(title, {
      body: body,
      icon: icon,
      badge: '/favicon.ico',
      tag: `order-${order.id}`,
      requireInteraction: true
    });
  }, []);

  // Check for status changes and send system notifications
  const checkStatusChanges = useCallback((newOrders) => {
    // If this is the first load, just set the orders without checking for changes
    if (!previousOrdersRef.current.length) {
      previousOrdersRef.current = newOrders;
      return;
    }

    const updatedOrders = new Set();

    newOrders.forEach(newOrder => {
      const previousOrder = previousOrdersRef.current.find(o => o.id === newOrder.id);
      
      if (previousOrder && previousOrder.status !== newOrder.status) {
        sendSystemNotification(newOrder.status, newOrder);
        updatedOrders.add(newOrder.id);
      }
    });

    // Show visual feedback for updated orders
    if (updatedOrders.size > 0) {
      setRecentlyUpdated(updatedOrders);
      
      // Clear the highlight after 3 seconds
      setTimeout(() => {
        setRecentlyUpdated(new Set());
      }, 3000);
    }

    previousOrdersRef.current = newOrders;
  }, [sendSystemNotification]);

  // Fallback manual loading function
  const loadOrdersManually = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading orders manually for user:', user.uid);
      
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid)
        // Temporarily removed orderBy to avoid index requirement
        // orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort orders by createdAt manually
      const sortedOrders = ordersData.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return bTime - aTime; // Descending order (newest first)
      });
      
      console.log('Manually loaded and sorted orders:', sortedOrders);
      
      setOrders(sortedOrders);
      previousOrdersRef.current = sortedOrders;
    } catch (error) {
      console.error('Error loading orders manually:', error);
      toast.error('Failed to load orders. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Real-time listener for orders
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    console.log('Setting up real-time listener for user:', user.uid);
    
    // Create real-time listener without orderBy to avoid index requirement
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
      // Temporarily removed orderBy to avoid index requirement
      // orderBy('createdAt', 'desc')
    );

    console.log('Firebase query created:', q);

    unsubscribeRef.current = onSnapshot(q, (snapshot) => {
      console.log('Snapshot received:', snapshot);
      console.log('Snapshot size:', snapshot.size);
      console.log('Snapshot empty:', snapshot.empty);
      
      const ordersData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Order doc:', doc.id, data);
        return { id: doc.id, ...data };
      });
      
      // Sort orders by createdAt manually to avoid index requirement
      const sortedOrders = ordersData.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return bTime - aTime; // Descending order (newest first)
      });
      
      console.log('Processed and sorted orders data:', sortedOrders);
      setOrders(sortedOrders);
      setLoading(false);
      
      // Check for status changes and send system notifications
      checkStatusChanges(sortedOrders);
    }, (error) => {
      console.error('Error listening to orders:', error);
      setLoading(false);
      // Fallback to manual loading
      loadOrdersManually();
    });

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user, checkStatusChanges, loadOrdersManually]);

  const refreshOrders = async () => {
    setRefreshing(true);
    console.log('Manual refresh requested');
    
    // Try to force a refresh by re-subscribing to the listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    
    // Use manual loading as fallback
    await loadOrdersManually();
    setRefreshing(false);
    toast.success('Orders refreshed');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'preparing':
        return <Package className="w-4 h-4 text-orange-500" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDescription = (status) => {
    switch (status) {
      case 'pending':
        return 'Your order has been received and is being processed';
      case 'accepted':
        return 'Your order has been accepted and will be prepared soon';
      case 'preparing':
        return 'Chefs are preparing your delicious food';
      case 'ready':
        return 'Your order is ready for pickup! 🎉';
      case 'delivered':
        return 'Order delivered successfully';
      case 'completed':
        return 'Order completed successfully! Thank you for your order';
      case 'rejected':
        return 'Order has been rejected. Please contact support if you have questions';
      case 'cancelled':
        return 'Order has been cancelled';
      default:
        return 'Order status unknown';
    }
  };

  const getEstimatedTime = (status, createdAt) => {
    if (!createdAt) return 'Unknown';
    
    const orderTime = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    switch (status) {
      case 'pending':
        return `Ordered ${diffMinutes} min ago`;
      case 'accepted':
        return `Accepted ${diffMinutes} min ago`;
      case 'preparing':
        return `Preparing for ${diffMinutes} min`;
      case 'ready':
        return 'Ready now! 🚀';
      case 'delivered':
        return `Delivered ${diffMinutes} min ago`;
      case 'completed':
        return `Completed ${diffMinutes} min ago`;
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getOrderTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">Track your food orders and delivery status</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Live updates enabled</span>
                {('Notification' in window) && Notification.permission !== 'granted' && (
                  <button
                    onClick={requestNotificationPermission}
                    className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Enable Notifications
                  </button>
                )}
                {('Notification' in window) && Notification.permission === 'granted' && (
                  <span className="ml-2 text-xs text-green-600">🔔 Notifications enabled</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <button
                onClick={refreshOrders}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50"
                title="Refresh orders"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start by browsing our menu!
            </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Ready to order some delicious food?</p>
                <a
                  href="/menu"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <span>Browse Menu</span>
                  <Package className="w-4 h-4" />
                </a>
              </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={`${order.id}-${order.status}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-300 ${
                  recentlyUpdated.has(order.id) 
                    ? 'border-blue-400 shadow-blue-100 bg-blue-50' 
                    : 'border-gray-200'
                }`}
              >
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-2 capitalize">{order.status}</span>
                      </span>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order.id.slice(-8)}
                          </h3>
                          {recentlyUpdated.has(order.id) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                              Updated
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{getEstimatedTime(order.status, order.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-xs text-gray-500">Ordered at: {order.createdAt?.toDate?.()?.toLocaleTimeString() || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${(order.total || 0).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{order.items?.length || 0} items</p>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="px-6 py-4">
                  {/* Status Description */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {/* <AlertCircle className="w-4 h-4 text-blue-600" /> */}
                      <span className="text-sm text-blue-800">{getStatusDescription(order.status)}</span>
                    </div>
                  </div>

                  {/* Canteen Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {/* <MapPin className="w-4 h-4 text-gray-600" /> */}
                      <span className="font-medium text-gray-900">{order.canteenName || 'Unknown Canteen'}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              {item.imageURL ? (
                                <img src={item.imageURL} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <span className="text-gray-400 text-xl">🍽️</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              {item.notes && (
                                <p className="text-xs text-gray-400">Note: {item.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-sm text-gray-500">${item.price} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Progress Timeline */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Order Progress</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Order placed</span>
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{order.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}</span>
                        </div>
                      </div>
                      
                      {order.status === 'accepted' && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Order accepted</span>
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>Accepted</span>
                          </div>
                        </div>
                      )}
                      
                      {order.status === 'preparing' && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Order confirmed and preparing</span>
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>In progress</span>
                          </div>
                        </div>
                      )}
                      
                      {order.status === 'ready' && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Order ready for pickup</span>
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>Ready now!</span>
                          </div>
                        </div>
                      )}
                      
                      {order.status === 'delivered' && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Order delivered</span>
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>Completed</span>
                          </div>
                        </div>
                      )}
                      
                      {order.status === 'completed' && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Order completed</span>
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>Completed</span>
                          </div>
                        </div>
                      )}
                      
                      {order.status === 'rejected' && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Order rejected</span>
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>Rejected</span>
                          </div>
                        </div>
                      )}
                      
                      {order.status === 'cancelled' && (
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">Order cancelled</span>
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>Cancelled</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>Total Items: {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</p>
                        {order.deliveryFee > 0 && (
                          <p>Delivery Fee: ${order.deliveryFee?.toFixed(2) || '0.00'}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          Total: ${getOrderTotal(order.items).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Need help? Contact the canteen directly or reach out to our support team.</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
