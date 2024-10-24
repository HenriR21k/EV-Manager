import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAZvEoEHEGZMhvPkPVlh8SeId2TuhSL8Rg",
  authDomain: "ev-management-a7a3e.firebaseapp.com",
  projectId: "ev-management-a7a3e",
  storageBucket: "ev-management-a7a3e.appspot.com",
  messagingSenderId: "771932815490",
  appId: "1:771932815490:web:5a3be01196f9f22b48349b",
  measurementId: "G-X8QVV408JX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();