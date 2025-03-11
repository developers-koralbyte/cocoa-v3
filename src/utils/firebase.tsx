// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, signOut, Auth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore, Firestore } from 'firebase/firestore';

// Your Firebase configuration from firebase.js
const firebaseConfig = {
    apiKey: 'AIzaSyD_GCb4vx2f5N1qYQd1mdMD9pAQEnZmrYE',
    authDomain: 'cocoa-41963.firebaseapp.com',
    projectId: 'cocoa-41963',
    storageBucket: 'cocoa-41963.appspot.com',
    messagingSenderId: '240199251239',
    appId: '1:240199251239:web:75a4bf2c18905abd15e502',
    measurementId: 'G-4XD7MTWHVD',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth: Auth = getAuth();
export const db: Firestore = getFirestore();
export const storage = getStorage();
export const userSignOut = () => signOut(auth);

// Export default for easier importing
export default { app, auth, db, storage, userSignOut };