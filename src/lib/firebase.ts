import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyANmsIKeIS2zHbbNuwn8L3ZgZxbanNYDUk",
  authDomain: "carely-9e601.firebaseapp.com",
  projectId: "carely-9e601",
  storageBucket: "carely-9e601.firebasestorage.app",
  messagingSenderId: "369507063369",
  appId: "1:369507063369:web:62f1adfc38503338441198",
  measurementId: "G-QMRGJKMX1D",
};

// getApps() check prevents re-initialization on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
