import { initializeApp, getApps, getApp, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Explicitly set the project ID in the environment to avoid confusion with the AI Studio project
process.env.GOOGLE_CLOUD_PROJECT = firebaseConfig.projectId;
process.env.FIREBASE_CONFIG = JSON.stringify({
  projectId: firebaseConfig.projectId,
  storageBucket: `${firebaseConfig.projectId}.appspot.com`,
});

// Initialize Firebase Admin
const initializeAdmin = () => {
  const apps = getApps();
  if (apps.length > 0) return apps[0];
  
  console.log('Initializing Firebase Admin with default credentials...');
  // initializeApp() without arguments uses the environment's service account
  return initializeApp();
};

const adminApp = initializeAdmin();

// Initialize Firestore and Auth
// Use the database ID from config if available, otherwise default
const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
console.log('Using Firestore Database ID:', dbId);

export const db = getFirestore(adminApp, dbId);
export const auth = getAuth(adminApp);
