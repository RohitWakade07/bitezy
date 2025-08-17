import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ 
  message = "Loading...", 
  showSpinner = true,
  className = "" 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        fixed inset-0 bg-white z-50 flex flex-col items-center justify-center
        ${className}
      `}
    >
      {/* Logo/Brand */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -20 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8"
      >
        <motion.div 
          className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cream via-purple-600 rounded-2xl flex items-center justify-center shadow-xl"
          whileHover={{ scale: 1.05 }}
          animate={{
            boxShadow: [
              "0 10px 25px -5px rgba(59, 130, 246, 0.3)",
              "0 20px 40px -5px rgba(147, 51, 234, 0.4)",
              "0 10px 25px -5px rgba(59, 130, 246, 0.3)"
            ],
            scale: [1, 1.02, 1]
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <motion.img
            src="/logo.png"
            alt="Bitezy Logo"
            className="w-16 h-16 object-contain"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ rotate: 360 }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <motion.div
            className="w-16 h-16 flex items-center justify-center text-white text-2xl font-bold"
            style={{ display: 'none' }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            B
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Spinner */}
      {showSpinner && (
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <Loader2 className="w-8 h-8 text-primary-500" />
        </motion.div>
      )}

      {/* Loading Message */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-lg text-gray-600 font-medium"
      >
        {message}
      </motion.p>

      {/* Loading Dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex space-x-1 mt-4"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </motion.div>

      {/* Progress Bar (Optional) */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600"
      />
    </motion.div>
  );
};

export default LoadingScreen;
