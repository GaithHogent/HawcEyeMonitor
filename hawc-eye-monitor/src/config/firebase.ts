// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBGjeMD7r8cIRbZMzVNrc2YZxWeOl9C_7A",
  authDomain: "hawc-eye-monitor.firebaseapp.com",
  projectId: "hawc-eye-monitor",
  storageBucket: "hawc-eye-monitor.firebasestorage.app",
  messagingSenderId: "940874818394",
  appId: "1:940874818394:web:1b1281392e8a390f0b8963"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);



// -------------------
// Emulator connections
// -------------------
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectAuthEmulator } from "firebase/auth";

if (__DEV__) {
  connectFirestoreEmulator(db, "10.0.2.2", 8086);
  connectAuthEmulator(auth, "http://10.0.2.2:9100");
}
