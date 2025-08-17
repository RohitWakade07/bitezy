import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Star, 
  Clock, 
  Plus, 
  Minus,
  Leaf,
  Zap
} from 'lucide-react';

const FoodCard = ({ 
  item, 
  food, // Keep for backward compatibility
  onAddToCart, 
  onToggleFavorite, 
  showQuantity = false,
  showAddButton = true,
  className = "" 
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Use item prop if available, otherwise fall back to food prop
  const foodItem = item || food;

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    if (onToggleFavorite) {
      onToggleFavorite(foodItem, !isFavorite);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(foodItem, quantity);
    }
  };

  const increaseQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const getDiscountPrice = () => {
    if (foodItem.discount && foodItem.discount > 0) {
      const discountAmount = (foodItem.price * foodItem.discount) / 100;
      return foodItem.price - discountAmount;
    }
    return foodItem.price;
  };

  const hasDiscount = foodItem.discount && foodItem.discount > 0;
  const currentPrice = getDiscountPrice();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden
        hover:shadow-medium transition-all duration-200 ${className}
      `}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={foodItem.image}
          alt={foodItem.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        
        {/* Favorite Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleFavoriteToggle}
          className={`
            absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200
            ${isFavorite 
              ? 'bg-red-500 text-white shadow-lg' 
              : 'bg-white/80 text-gray-600 hover:bg-white'
            }
          `}
        >
          <Heart 
            className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} 
          />
        </motion.button>

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{foodItem.discount}%
          </div>
        )}

        {/* Dietary Tags */}
        <div className="absolute bottom-3 left-3 flex gap-1">
          {foodItem.isVegetarian && (
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              Veg
            </div>
          )}
          {foodItem.spiceLevel && foodItem.spiceLevel > 2 && (
            <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Spicy
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900 text-lg leading-tight">
            {foodItem.name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {foodItem.description}
        </p>

        {/* Rating and Time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">
              {foodItem.rating}
            </span>
            <span className="text-xs text-gray-500">
              ({foodItem.reviews})
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{foodItem.preparationTime}min</span>
          </div>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-primary-600">
                  {formatPrice(currentPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(foodItem.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary-600">
                {formatPrice(foodItem.price)}
              </span>
            )}
          </div>

          {showQuantity ? (
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={decreaseQuantity}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </motion.button>
              
              <span className="w-8 text-center font-medium text-gray-700">
                {quantity}
              </span>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={increaseQuantity}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>
          ) : (
            showAddButton && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="bg-primary-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </motion.button>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FoodCard;
