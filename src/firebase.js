// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "fans-social-9d019.firebaseapp.com",
  projectId: "fans-social-9d019",
  storageBucket: "fans-social-9d019.firebasestorage.app",
  messagingSenderId: "459728232311",
  appId: "1:459728232311:web:26e0fdd90c20058ac14b72",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
