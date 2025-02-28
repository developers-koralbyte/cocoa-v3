// Import required Firebase functions and services
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Firestore for database
import { getAuth ,GoogleAuthProvider} from "firebase/auth"; // Firebase Authentication (if needed)

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7eZnsehmwwSsIHB7pypNiTgtTpPLLy_0",
  authDomain: "cocoa-f8fa4.firebaseapp.com",
  projectId: "cocoa-f8fa4",
  storageBucket: "cocoa-f8fa4.appspot.com", // corrected storage bucket URL
  messagingSenderId: "1011521722110",
  appId: "1:1011521722110:web:602896b0f95afe8e06f7af",
  measurementId: "G-877B6SX92K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Firestore instance
const auth = getAuth(app); // Auth instance (if needed)

const googleProvider = new GoogleAuthProvider();

export { app, analytics, db, auth, googleProvider };
