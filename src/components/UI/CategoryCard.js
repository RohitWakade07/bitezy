import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CategoryCard = ({ name, icon, isActive, onClick, className = "" }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(name === 'All' ? 'all' : name);
    }
  };

  const cardContent = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative overflow-hidden rounded-2xl p-4 text-center cursor-pointer transition-all duration-200
        ${isActive ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
        ${className}
        hover:shadow-lg transform hover:-translate-y-1
      `}
      onClick={handleClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
      </div>

      {/* Icon */}
      <div className="relative z-10 mb-3">
        <span className="text-3xl">{icon}</span>
      </div>

      {/* Category Name */}
      <h3 className="relative z-10 font-semibold text-sm">
        {name}
      </h3>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );

  return cardContent;
};

export default CategoryCard;
