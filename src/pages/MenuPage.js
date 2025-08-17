import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { 
  Search, 
  Plus, 
  Clock,
  XCircle,
  CheckCircle,
  Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const MenuPage = () => {
  const { addToCart } = useCart();
  const [canteens, setCanteens] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    loadCanteens();
  }, []);

  useEffect(() => {
    if (selectedCanteen) {
      loadMenuItems(selectedCanteen.id);
    }
  }, [selectedCanteen]);

  const loadCanteens = async () => {
    try {
      const canteensSnapshot = await getDocs(collection(db, 'canteens'));
      const canteensData = canteensSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCanteens(canteensData);
      
      if (canteensData.length > 0) {
        setSelectedCanteen(canteensData[0]);
      }
    } catch (error) {
      console.error('Error loading canteens:', error);
      toast.error('Failed to load canteens');
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async (canteenId) => {
    try {
      const menuSnapshot = await getDocs(collection(db, `canteens/${canteenId}/menuItems`));
      const menuData = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuItems(menuData);
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast.error('Failed to load menu items');
    }
  };

  const handleAddToCart = async (item) => {
    try {
      // Add canteen information to the item before adding to cart
      const itemWithCanteen = {
        ...item,
        canteenId: selectedCanteen.id,
        canteenName: selectedCanteen.name,
        canteenLocation: selectedCanteen.location
      };
      
      await addToCart(itemWithCanteen);
      toast.success(`${item.name} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  const getOrderStatusInfo = (canteen) => {
    if (canteen.isTakingOrders === false) {
      return {
        status: 'closed',
        text: 'Not Taking Orders',
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-4 h-4" />
      };
    }
    
    if (canteen.isTakingOrders === true) {
      return {
        status: 'open',
        text: 'Taking Orders',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />
      };
    }
    
    // Default to open if not specified
    return {
      status: 'open',
      text: 'Taking Orders',
      color: 'bg-green-100 text-green-800',
      icon: <CheckCircle className="w-4 h-4" />
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (canteens.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No canteens available</h2>
          <p className="text-gray-600">Please check back later.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Menu</h1>
            <div className="text-sm text-gray-500">
              Browse and order delicious food
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Canteen Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Canteen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {canteens.map((canteen) => {
              const orderStatus = getOrderStatusInfo(canteen);
              return (
                <motion.div
                  key={canteen.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => setSelectedCanteen(canteen)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedCanteen?.id === canteen.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Store className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{canteen.name}</h3>
                          <p className="text-sm text-gray-500">{canteen.location}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${orderStatus.color}`}>
                        {orderStatus.icon}
                        <span className="ml-1">{orderStatus.text}</span>
                      </span>
                    </div>
                    
                    {canteen.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{canteen.description}</p>
                    )}
                    
                    {canteen.openTime && canteen.closeTime && (
                      <div className="mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {canteen.openTime} - {canteen.closeTime}
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {selectedCanteen && (
          <>
            {/* Canteen Info Banner */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCanteen.name}</h2>
                    <p className="text-gray-600">{selectedCanteen.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  {(() => {
                    const orderStatus = getOrderStatusInfo(selectedCanteen);
                    return (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${orderStatus.color}`}>
                        {orderStatus.icon}
                        <span className="ml-2">{orderStatus.text}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>
              
              {selectedCanteen.description && (
                <p className="mt-3 text-gray-600">{selectedCanteen.description}</p>
              )}
            </div>

            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
              {/* Enhanced Search Bar */}
              <div className="max-w-md">
                <motion.div
                  className={`relative transition-all duration-300 ${
                    searchFocused ? 'scale-105' : 'scale-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                      searchFocused ? 'text-blue-500 w-5 h-5' : 'text-gray-400 w-4 h-4'
                    }`} />
                    <input
                      type="text"
                      placeholder="Search menu items..."
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
                  </div>
                </motion.div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredMenuItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="aspect-video bg-gray-200 flex items-center justify-center relative overflow-hidden">
                      {item.imageURL ? (
                        <motion.img
                          src={item.imageURL}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        />
                      ) : (
                        <div className="text-gray-400 text-4xl">🍽️</div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </div>
                      
                      {/* Availability Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.isAvailable !== false 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isAvailable !== false ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.name}</h3>
                      {item.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">${item.price}</span>
                        <motion.button
                          onClick={() => handleAddToCart(item)}
                          disabled={item.isAvailable === false}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            item.isAvailable !== false
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <Plus className="w-4 h-4 inline mr-1" />
                          Add to Cart
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredMenuItems.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No menu items found</h3>
                <p className="text-gray-600">
                  {searchQuery ? `No items match "${searchQuery}"` : 'No items available in this category.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
