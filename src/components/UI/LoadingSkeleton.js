import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = ({ type = 'card', className = "" }) => {
  const shimmer = {
    initial: { x: -100 },
    animate: { x: '100%' },
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'easeInOut'
    }
  };

  if (type === 'card') {
    return (
      <div className={`bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden ${className}`}>
        {/* Image skeleton */}
        <div className="h-48 bg-gray-200 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            {...shimmer}
          />
        </div>
        
        {/* Content skeleton */}
        <div className="p-4">
          {/* Title skeleton */}
          <div className="h-6 bg-gray-200 rounded mb-2 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              {...shimmer}
            />
          </div>
          
          {/* Description skeleton */}
          <div className="space-y-2 mb-3">
            <div className="h-4 bg-gray-200 rounded relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                {...shimmer}
              />
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                {...shimmer}
              />
            </div>
          </div>
          
          {/* Rating and time skeleton */}
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-gray-200 rounded w-20 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                {...shimmer}
              />
            </div>
            <div className="h-4 bg-gray-200 rounded w-16 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                {...shimmer}
              />
            </div>
          </div>
          
          {/* Price and button skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-20 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                {...shimmer}
              />
            </div>
            <div className="h-10 bg-gray-200 rounded-xl w-24 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                {...shimmer}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'category') {
    return (
      <div className={`bg-gray-200 rounded-2xl p-4 text-center ${className}`}>
        {/* Icon skeleton */}
        <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            {...shimmer}
          />
        </div>
        
        {/* Name skeleton */}
        <div className="h-4 bg-gray-300 rounded w-16 mx-auto relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            {...shimmer}
          />
        </div>
      </div>
    );
  }

  if (type === 'list-item') {
    return (
      <div className={`flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 ${className}`}>
        {/* Image skeleton */}
        <div className="w-16 h-16 bg-gray-200 rounded-lg relative overflow-hidden flex-shrink-0">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            {...shimmer}
          />
        </div>
        
        {/* Content skeleton */}
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              {...shimmer}
            />
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/2 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              {...shimmer}
            />
          </div>
        </div>
        
        {/* Price skeleton */}
        <div className="h-6 bg-gray-200 rounded w-16 relative overflow-hidden flex-shrink-0">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            {...shimmer}
          />
        </div>
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="h-4 bg-gray-200 rounded relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            {...shimmer}
          />
        </div>
        <div className="h-4 bg-gray-200 rounded w-5/6 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            {...shimmer}
          />
        </div>
        <div className="h-4 bg-gray-200 rounded w-4/6 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            {...shimmer}
          />
        </div>
      </div>
    );
  }

  // Default skeleton
  return (
    <div className={`bg-gray-200 rounded-lg ${className}`}>
      <motion.div
        className="h-full w-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
        {...shimmer}
      />
    </div>
  );
};

export default LoadingSkeleton;
