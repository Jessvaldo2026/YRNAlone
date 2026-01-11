// FILE: src/firebase.js
// Firebase configuration for YRNAlone

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVdxN5zwUD48aANTvd8XI0cO593qFeloU",
  authDomain: "yrnalone-1cc5e.firebaseapp.com",
  projectId: "yrnalone-1cc5e",
  storageBucket: "yrnalone-1cc5e.firebasestorage.app",
  messagingSenderId: "294118211249",
  appId: "1:294118211249:web:2fe24c371f398bf30dec90"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
