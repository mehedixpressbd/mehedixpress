// MEHEDI XPRESS — FIREBASE INITIALIZATION
// File: /assets/js/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyATKk9r50AZYrdbVxzPxn0h8WBI-ESNZGQ",
  authDomain: "mehedi-xpress.firebaseapp.com",
  projectId: "mehedi-xpress",
  storageBucket: "mehedi-xpress.firebasestorage.app",
  messagingSenderId: "750136252870",
  appId: "1:750136252870:web:201f53d2dfeac82eb07ac7"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
