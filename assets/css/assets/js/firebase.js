// MEHEDI XPRESS — FIREBASE INITIALIZATION
// File location: /assets/js/firebase.js
// আলাদা firebase-config.js ফাইল প্রয়োজন নেই।

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyATKk9r50AZYrdbVxzPxn0h8WBI-ESNZGQ",
  authDomain: "mehedi-xpress.firebaseapp.com",
  projectId: "mehedi-xpress",
  storageBucket: "mehedi-xpress.firebasestorage.app",
  messagingSenderId: "750136252870",
  appId: "1:750136252870:web:201f53d2dfeac82eb07ac7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Firebase Authentication
export const auth = getAuth(app);

// Cloud Firestore Database
export const db = getFirestore(app);
