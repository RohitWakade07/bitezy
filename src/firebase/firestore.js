import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { db } from "./config";

// ===== CANTEEN MANAGEMENT =====

// Create a new canteen
export const createCanteen = async (canteenData) => {
  try {
    const docRef = await addDoc(collection(db, "canteens"), {
      ...canteenData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating canteen:", error);
    throw error;
  }
};

// Get all canteens with real-time updates
export const subscribeToCanteens = (callback) => {
  const q = query(collection(db, "canteens"), where("isActive", "==", true));
  return onSnapshot(q, (snapshot) => {
    const canteens = [];
    snapshot.forEach((doc) => {
      canteens.push({ id: doc.id, ...doc.data() });
    });
    callback(canteens);
  });
};

// Get a specific canteen
export const getCanteen = async (canteenId) => {
  try {
    const docSnap = await getDoc(doc(db, "canteens", canteenId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting canteen:", error);
    throw error;
  }
};

// Update canteen
export const updateCanteen = async (canteenId, updateData) => {
  try {
    await updateDoc(doc(db, "canteens", canteenId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating canteen:", error);
    throw error;
  }
};

// Delete canteen (soft delete)
export const deleteCanteen = async (canteenId) => {
  try {
    await updateDoc(doc(db, "canteens", canteenId), {
      isActive: false,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error deleting canteen:", error);
    throw error;
  }
};

// ===== MENU ITEM MANAGEMENT =====

// Add menu item to a canteen
export const addMenuItem = async (canteenId, menuItemData) => {
  try {
    const docRef = await addDoc(collection(db, `canteens/${canteenId}/menuItems`), {
      ...menuItemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isAvailable: true
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding menu item:", error);
    throw error;
  }
};

// Get menu items for a canteen with real-time updates
export const subscribeToMenuItems = (canteenId, callback) => {
  const q = query(
    collection(db, `canteens/${canteenId}/menuItems`),
    where("isAvailable", "==", true),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const menuItems = [];
    snapshot.forEach((doc) => {
      menuItems.push({ id: doc.id, ...doc.data() });
    });
    callback(menuItems);
  });
};

// Update menu item
export const updateMenuItem = async (canteenId, itemId, updateData) => {
  try {
    await updateDoc(doc(db, `canteens/${canteenId}/menuItems`, itemId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    throw error;
  }
};

// Delete menu item (soft delete)
export const deleteMenuItem = async (canteenId, itemId) => {
  try {
    await updateDoc(doc(db, `canteens/${canteenId}/menuItems`, itemId), {
      isAvailable: false,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    throw error;
  }
};

// ===== ORDER MANAGEMENT =====

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const docRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Get orders for a canteen with real-time updates
export const subscribeToOrders = (canteenId, callback) => {
  const q = query(
    collection(db, "orders"),
    where("canteenId", "==", canteenId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const orders = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    callback(orders);
  });
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    await updateDoc(doc(db, "orders", orderId), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

// ===== USER MANAGEMENT =====

// Create or update user
export const createOrUpdateUser = async (userId, userData) => {
  try {
    await setDoc(doc(db, "users", userId), {
      ...userData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    throw error;
  }
};

// Get user by ID
export const getUser = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

// ===== BATCH OPERATIONS =====

// Batch create multiple menu items
export const batchCreateMenuItems = async (canteenId, menuItems) => {
  try {
    const batch = writeBatch(db);
    
    menuItems.forEach((item) => {
      const docRef = doc(collection(db, `canteens/${canteenId}/menuItems`));
      batch.set(docRef, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isAvailable: true
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error batch creating menu items:", error);
    throw error;
  }
};
