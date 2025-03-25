// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth, signOut,GoogleAuthProvider } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getFirestore } from 'firebase/firestore'


// const firebaseConfig = {
//     apiKey: 'AIzaSyD_GCb4vx2f5N1qYQd1mdMD9pAQEnZmrYE',
//     authDomain: 'cocoa-41963.firebaseapp.com',
//     projectId: 'cocoa-41963',
//     storageBucket: 'cocoa-41963.appspot.com',
//     messagingSenderId: '240199251239',
//     appId: '1:240199251239:web:75a4bf2c18905abd15e502',
//     measurementId: 'G-4XD7MTWHVD',
// }

const firebaseConfig = {
    apiKey: "AIzaSyDD-07ZMTFnqT94ZNyfMw5Id9eK4nRTeC8",
    authDomain: "cocoa-2d172.firebaseapp.com",
    projectId: "cocoa-2d172",
    storageBucket: "cocoa-2d172.appspot.com",
    messagingSenderId: "83261605826",
    appId: "1:83261605826:web:da54b56e21493a64af785b"
  };
// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()
export const userSignOut = signOut(auth)
export const googleProvider = new GoogleAuthProvider();
