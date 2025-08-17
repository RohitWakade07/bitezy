import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { 
  Search, 
  ArrowRight, 
  Clock, 
  ShoppingCart, 
  Utensils, 
  ChefHat, 
  Truck, 
  Shield, 
  Star, 
  MapPin, 
  Percent, 
  X, 
  Store,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const HomePage = () => {
  const { user } = useAuth();
  const { getTotalItems } = useCart();
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showDiscountBanner, setShowDiscountBanner] = useState(true);

  useEffect(() => {
    loadCanteens();
  }, []);

  const loadCanteens = async () => {
    try {
      const canteensSnapshot = await getDocs(collection(db, 'canteens'));
      const canteensData = canteensSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCanteens(canteensData.filter(canteen => canteen.isActive));
    } catch (error) {
      console.error('Error loading canteens:', error);
      toast.error('Failed to load canteens');
    } finally {
      setLoading(false);
    }
  };

  const filteredCanteens = canteens.filter(canteen =>
    canteen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    canteen.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickActions = [
    {
      title: 'Browse Menu',
      description: 'Explore delicious food options',
      icon: <Utensils className="w-8 h-8" />,
      link: '/menu',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Track Orders',
      description: 'Check your order status',
      icon: <Clock className="w-8 h-8" />,
      link: '/orders',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'View Cart',
      description: `${getTotalItems()} items in cart`,
      icon: (
        <div className="relative">
          <ShoppingCart className="w-8 h-8" />
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {getTotalItems() > 99 ? '99+' : getTotalItems()}
            </span>
          )}
        </div>
      ),
      link: '/cart',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const features = [
    {
      icon: <ChefHat className="w-6 h-6" />,
      title: 'Fresh Food',
      description: 'Made fresh daily by expert chefs'
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: 'Fast Delivery',
      description: 'Quick pickup and delivery service'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Safe & Secure',
      description: 'Hygienic food preparation standards'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Bitezy" 
                className="w-10 h-10 rounded-lg"
              />
              <h1 className="text-3xl font-bold text-gray-900">Bitezy</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Welcome back,</p>
              <p className="font-medium text-gray-900">{user?.displayName || user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. Discount Banner - First Position */}
        <AnimatePresence>
          {showDiscountBanner && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
            >
              {/* Background Sparkles */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-white bg-opacity-20 rounded-full animate-pulse"></div>
                <div className="absolute top-8 right-8 w-4 h-4 bg-white bg-opacity-30 rounded-full animate-ping"></div>
                <div className="absolute bottom-4 left-1/2 w-6 h-6 bg-white bg-opacity-25 rounded-full animate-bounce"></div>
              </div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-full">
                    <Percent className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Special Offer!</h3>
                    <p className="text-purple-100 text-lg">Get 5% OFF on your first order</p>
                    <p className="text-purple-200 text-sm">Use code: FIRST5</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDiscountBanner(false)}
                  className="text-white hover:text-purple-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Delicious Food, Delivered Fast
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Order from your favorite canteens and enjoy fresh, tasty meals. 
            Quick pickup, great prices, and amazing food!
          </p>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <motion.div
              className={`relative transition-all duration-300 ${
                searchFocused ? 'scale-105' : 'scale-100'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  searchFocused ? 'text-blue-500 w-6 h-6' : 'text-gray-400 w-5 h-5'
                }`} />
                <input
                  type="text"
                  placeholder="Search canteens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 text-black ${
                    searchFocused 
                      ? 'border-blue-500 shadow-lg shadow-blue-200' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                
                {/* Search Bar Glow Effect */}
                {searchFocused && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 blur-xl -z-10"
                  />
                )}
                
                {/* Floating Search Icon */}
                {searchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-2 -right-2"
                  >
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Search Suggestions */}
              <AnimatePresence>
                {searchQuery && searchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-60 overflow-y-auto"
                  >
                    {filteredCanteens.slice(0, 5).map((canteen) => (
                      <Link
                        key={canteen.id}
                        to={`/menu?canteen=${canteen.id}`}
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Store className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{canteen.name}</p>
                            <p className="text-sm text-gray-500">{canteen.location}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {filteredCanteens.length === 0 && (
                      <div className="px-4 py-3 text-gray-500 text-center">
                        No canteens found
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        {/* 2. Quick Actions - Ready to Order (Second Position) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to Order?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group block"
              >
                <motion.div
                  className={`${action.color} text-white p-6 rounded-xl transition-all duration-200 group-hover:scale-105`}
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 5,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <motion.div 
                        className="mb-3"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        {action.icon}
                      </motion.div>
                      <h4 className="text-xl font-semibold mb-2">{action.title}</h4>
                      <p className="text-blue-100">{action.description}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* 3. Canteens Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Available Canteens</h3>
            <Link
              to="/menu"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {filteredCanteens.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="text-6xl mb-4">🍽️</div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">No canteens found</h4>
              <p className="text-gray-600">
                {searchQuery ? `No canteens match "${searchQuery}"` : 'No canteens available at the moment.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCanteens.slice(0, 6).map((canteen, index) => (
                <motion.div
                  key={canteen.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Link
                    to={`/menu?canteen=${canteen.id}`}
                    className="group block"
                  >
                    <motion.div 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                      whileHover={{ 
                        y: -5,
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="aspect-video bg-gray-200 flex items-center justify-center relative overflow-hidden">
                        {canteen.imageURL ? (
                          <motion.img
                            src={canteen.imageURL}
                            alt={canteen.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            whileHover={{ scale: 1.1 }}
                          />
                        ) : (
                          <div className="text-gray-400 text-4xl">🏪</div>
                        )}
                        
                        {/* Order Status Badge */}
                        <div className="absolute top-2 right-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            canteen.isTakingOrders !== false 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {canteen.isTakingOrders !== false ? 'Taking Orders' : 'Closed'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-lg">{canteen.name}</h4>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">4.5</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {canteen.description || 'Delicious food and great service'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{canteen.location || 'Campus'}</span>
                          </div>
                          <div className="text-blue-600 group-hover:text-blue-700 font-medium">
                            Order Now →
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 4. Features - Why Choose Bitezy (Last Position) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Bitezy?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center"
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-blue-600">{feature.icon}</div>
                </motion.div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
