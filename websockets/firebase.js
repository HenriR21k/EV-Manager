import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getDatabase} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAZvEoEHEGZMhvPkPVlh8SeId2TuhSL8Rg",
  authDomain: "ev-management-a7a3e.firebaseapp.com",
  databaseURL: "https://ev-management-a7a3e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ev-management-a7a3e",
  storageBucket: "ev-management-a7a3e.appspot.com",
  messagingSenderId: "771932815490",
  appId: "1:771932815490:web:5a3be01196f9f22b48349b",
  measurementId: "G-X8QVV408JX"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getDatabase(app);
export default app;