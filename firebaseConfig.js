import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8JwkMUN2MpAcSP1kPiuEm_0Po3CkWMlQ",
  authDomain: "mtgcalc-3bb3e.firebaseapp.com",
  projectId: "mtgcalc-3bb3e",
  storageBucket: "mtgcalc-3bb3e.appspot.com",
  messagingSenderId: "276119664126",
  appId: "1:276119664126:web:33d4f4b6ef07eafb083caf",
  measurementId: "G-6E3JWJ14KC"
};

// Initialize Firebase only if it hasn't been initialized yet
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // Catch the "already exists" error and get the existing app
  if (error.code === 'app/duplicate-app') {
    app = getApp(); // Get the existing app
  } else {
    console.error('Firebase initialization error:', error);
  }
}

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the initialized services
export { auth, db, storage };