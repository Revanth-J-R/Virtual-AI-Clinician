// src/app/firebaseConfig.js
import { getApp, getApps, initializeApp } from "firebase/app";

// These should be your public Firebase config keys (not the private admin keys!)
const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Ensure Firebase is only initialized once in the client
let firebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(clientConfig);
} else {
  firebaseApp = getApp();
}

export default firebaseApp;
