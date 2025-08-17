import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load cart from Firestore when user changes
  useEffect(() => {
    if (user?.uid) {
      loadCartFromFirestore();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const loadCartFromFirestore = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const cartDoc = await getDoc(doc(db, 'users', user.uid, 'cart', 'items'));
      if (cartDoc.exists()) {
        setCartItems(cartDoc.data().items || []);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCartToFirestore = async (items) => {
    if (!user?.uid) return;
    
    try {
      await setDoc(doc(db, 'users', user.uid, 'cart', 'items'), { items });
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = async (item) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      const updatedItems = cartItems.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
      setCartItems(updatedItems);
      await saveCartToFirestore(updatedItems);
    } else {
      const newItems = [...cartItems, { ...item, quantity: 1 }];
      setCartItems(newItems);
      await saveCartToFirestore(newItems);
    }
  };

  const removeFromCart = async (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    await saveCartToFirestore(updatedItems);
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    
    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
    setCartItems(updatedItems);
    await saveCartToFirestore(updatedItems);
  };

  const clearCart = async () => {
    setCartItems([]);
    await saveCartToFirestore([]);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
