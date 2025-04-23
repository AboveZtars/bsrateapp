import {initializeApp, getApp} from "firebase/app";
import {getFirestore, Firestore} from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once
let firestoreInstance: Firestore;

function getFirestoreInstance(): Firestore {
  try {
    // Try to get existing app instance
    const app = getApp();
    if (!firestoreInstance) {
      firestoreInstance = getFirestore(app, "ratesve");
    }
  } catch (e) {
    // App not initialized, create a new one
    const app = initializeApp(firebaseConfig);
    firestoreInstance = getFirestore(app, "ratesve");
  }
  return firestoreInstance;
}

export const firestore = getFirestoreInstance();
