import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs,
  getDoc,
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Use environment variables (e.g. on Vercel) if present, or fallback to firebase-applet-config.json
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
};

const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseAppletConfig.firestoreDatabaseId;

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Ensure named database is passed if specified in config, and auto-detect long polling for iframe compatibility
let dbInstance;
try {
  const settings = { 
    experimentalAutoDetectLongPolling: true
  };
  if (databaseId && databaseId !== '(default)') {
    dbInstance = initializeFirestore(app, settings, databaseId);
  } else {
    dbInstance = initializeFirestore(app, settings);
  }
} catch (e) {
  dbInstance = databaseId && databaseId !== '(default)' 
    ? getFirestore(app, databaseId)
    : getFirestore(app);
}

export const db = dbInstance;

export { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs, getDoc, writeBatch, query, orderBy };
