import React from 'react';
import { motion } from 'framer-motion';

const Layout = ({ children, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen bg-gray-50 ${className}`}
    >
      {/* Safe Area Top Spacing */}
      <div className="safe-area-top bg-primary-500 h-6" />
      
      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
      
      {/* Safe Area Bottom Spacing */}
      <div className="safe-area-bottom h-6" />
    </motion.div>
  );
};

export default Layout;
