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
  try {
    const apps = getApps();
    if (apps.length > 0) return apps[0];
    
    console.log('Initializing Firebase Admin...');
    
    // Check if we have service account credentials in the environment
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        return initializeApp({
          credential: (await import('firebase-admin/app')).cert(serviceAccount),
          projectId: serviceAccount.project_id
        });
      } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT as JSON:', e);
      }
    }
    
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      return initializeApp();
    }
    
    // Fallback: Try to initialize with just the project ID if that's all we have
    // This might work for some operations but verifyIdToken usually needs a service account
    if (firebaseConfig.projectId) {
      return initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }

    return initializeApp();
  } catch (error) {
    console.error('CRITICAL: Firebase Admin initialization failed:', error);
    // Return a dummy app or handle it gracefully to avoid crashing the whole server
    return null as any;
  }
};

const adminApp = initializeAdmin();

// Initialize Firestore and Auth
const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
console.log('Using Firestore Database ID:', dbId);

export const db = adminApp ? getFirestore(adminApp, dbId) : null as any;
export const auth = adminApp ? getAuth(adminApp) : null as any;
