import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  className = "",
  showMic = false,
  autoFocus = false 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleMicClick = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true);
      // Speech recognition logic would go here
      // For now, just simulate
      setTimeout(() => {
        setIsListening(false);
        setQuery('Chicken Biryani'); // Mock result
      }, 2000);
    } else {
      alert('Speech recognition not supported in this browser');
    }
  };

  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search 
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
              isFocused ? 'text-primary-500' : 'text-gray-400'
            }`} 
          />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`
              w-full pl-10 pr-12 py-3 bg-white border-2 rounded-xl text-gray-900 placeholder-gray-500
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
              ${isFocused 
                ? 'border-primary-500 shadow-lg shadow-primary-100' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          />

          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                onClick={handleClear}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {showMic && (
            <motion.button
              type="button"
              onClick={handleMicClick}
              whileTap={{ scale: 0.95 }}
              className={`
                absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200
                ${isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce' : ''}`} />
            </motion.button>
          )}
        </div>
      </form>

      {/* Search suggestions (optional) */}
      {isFocused && query && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          <div className="p-2">
            <div className="text-xs text-gray-500 mb-2 px-2">Recent searches</div>
            {['Chicken Biryani', 'Veggie Burger', 'Pasta Carbonara'].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(suggestion);
                  onSearch(suggestion);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SearchBar;
