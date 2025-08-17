import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Home, Menu, ShoppingCart, User, Shield } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { cartItems } = useCart();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/menu', icon: Menu, label: 'Menu' },
    { 
      path: '/cart', 
      icon: ShoppingCart, 
      label: 'Cart',
      showBadge: true,
      badgeCount: getCartItemCount()
    },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  // Add admin tab if user has admin privileges
  if (user?.role === 'admin' || user?.role === 'super_admin') {
    navItems.push({
      path: '/admin',
      icon: Shield,
      label: user?.role === 'super_admin' ? 'Super Admin' : 'Admin'
    });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 flex-1 transition-colors relative ${
                isActive(item.path)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6 mb-1" />
                {item.showBadge && item.badgeCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {item.badgeCount > 99 ? '99+' : item.badgeCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
