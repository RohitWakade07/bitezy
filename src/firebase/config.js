import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChPHqmqOe7TqJem_Vze4es5eeb3qSuOks",
  authDomain: "bitez-930cc.firebaseapp.com",
  projectId: "bitez-930cc",
  storageBucket: "bitez-930cc.firebasestorage.app",
  messagingSenderId: "976278081886",
  appId: "1:976278081886:web:407e566e73856d9a1f3fcf",
  measurementId: "G-J2WX2QM4KW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
