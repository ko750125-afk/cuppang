import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0701799372",
  appId: "1:198841776420:web:0f56dbfee2437c6ef95bb1",
  databaseURL: "https://gen-lang-client-0701799372-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "gen-lang-client-0701799372.firebasestorage.app",
  apiKey: "AIzaSyDGlcpvw4zTeNJKSG1YiTYregI8B4VyfzM",
  authDomain: "gen-lang-client-0701799372.firebaseapp.com",
  messagingSenderId: "198841776420",
  measurementId: "G-HJNPN4YM96"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
