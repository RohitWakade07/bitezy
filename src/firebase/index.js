// Export all Firebase services
export { default as app } from './config';
export { auth, db, storage, analytics } from './config';

// Auth services
export {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  onAuthStateChange,
  getCurrentUser
} from './auth';

// Firestore services
export {
  createCanteen,
  subscribeToCanteens,
  getCanteen,
  updateCanteen,
  deleteCanteen,
  addMenuItem,
  subscribeToMenuItems,
  updateMenuItem,
  deleteMenuItem,
  createOrder,
  subscribeToOrders,
  updateOrderStatus,
  createOrUpdateUser,
  getUser,
  batchCreateMenuItems
} from './firestore';

// Direct Firestore functions for components that need them
export {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

// Storage services
export {
  uploadImage,
  uploadMenuItemImage,
  uploadCanteenImage,
  deleteImage,
  getImageURL
} from './storage';
