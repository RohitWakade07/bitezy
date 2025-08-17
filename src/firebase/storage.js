import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./config";

// Upload image to Firebase Storage
export const uploadImage = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Upload menu item image
export const uploadMenuItemImage = async (file, canteenId, itemId) => {
  const path = `menu-items/${canteenId}/${itemId}/${file.name}`;
  return await uploadImage(file, path);
};

// Upload canteen logo/image
export const uploadCanteenImage = async (file, canteenId) => {
  const path = `canteens/${canteenId}/logo/${file.name}`;
  return await uploadImage(file, path);
};

// Delete image from Firebase Storage
export const deleteImage = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

// Get download URL for an image
export const getImageURL = async (path) => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error getting image URL:", error);
    throw error;
  }
};
