import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  onAuthStateChange
} from '../firebase/auth';
import {
  createOrUpdateUser,
  getUser
} from '../firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          let userData = await getUser(firebaseUser.uid);
          
          if (!userData) {
            // Create new user if they don't exist in Firestore
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: 'user',
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            await createOrUpdateUser(firebaseUser.uid, userData);
          }

          // Assign role based on email
          let userRole = userData.role || 'user';
          if (firebaseUser.email === 'vakderohit@gmail.com') {
            userRole = 'super_admin';
            console.log('🎯 Super admin role assigned to:', firebaseUser.email);
          } else if (firebaseUser.email?.includes('admin')) {
            userRole = 'admin';
            console.log('🔑 Admin role assigned to:', firebaseUser.email);
          } else if (userData.isCanteenStaff) {
            userRole = 'canteen_staff';
            console.log('🏪 Canteen staff role assigned to:', firebaseUser.email);
          } else {
            console.log('👤 User role assigned to:', firebaseUser.email);
          }

          const finalUserData = {
            ...userData,
            role: userRole,
            isEmailVerified: firebaseUser.emailVerified
          };

          console.log('📋 Setting user data:', finalUserData);
          setUser(finalUserData);
        } catch (error) {
          console.error('Error fetching/creating user data:', error);
          // Fallback to basic user data
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: 'user',
            isEmailVerified: firebaseUser.emailVerified
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const user = await signInWithGoogle();
      return user;
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message);
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      setError(null);
      const user = await signInWithEmail(email, password);
      return user;
    } catch (error) {
      console.error('Email login error:', error);
      setError(error.message);
      throw error;
    }
  };

  const registerWithEmail = async (email, password, displayName) => {
    try {
      setError(null);
      const user = await signUpWithEmail(email, password, displayName);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      if (user?.uid) {
        await createOrUpdateUser(user.uid, profileData);
        setUser(prev => ({ ...prev, ...profileData }));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.message);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login: loginWithEmail,
    loginWithGoogle,
    register: registerWithEmail,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isSuperAdmin: user?.role === 'super_admin',
    isCanteenStaff: user?.role === 'canteen_staff' || user?.isCanteenStaff
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
