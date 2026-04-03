import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

// Load firebase config manually to avoid ESM import issues with JSON
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = {};
try {
  if (fs.existsSync(firebaseConfigPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
  } else {
    console.warn('firebase-applet-config.json not found. Using environment variables.');
    firebaseConfig = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || '(default)'
    };
  }
} catch (e) {
  console.error('Error loading firebase config:', e);
}

// Explicitly set the project ID in the environment to avoid confusion with the AI Studio project
const projectId = firebaseConfig.projectId || process.env.GOOGLE_CLOUD_PROJECT;

if (projectId) {
  process.env.GOOGLE_CLOUD_PROJECT = projectId;
  process.env.FIREBASE_CONFIG = JSON.stringify({
    projectId: projectId,
    storageBucket: `${projectId}.appspot.com`,
  });
}

// Initialize Firebase Admin
const initializeAdmin = () => {
  try {
    const apps = getApps();
    if (apps.length > 0) return apps[0];
    
    console.log('Initializing Firebase Admin for project:', projectId);
    
    // 1. Check if we have service account credentials in the environment
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        let saString = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
        
        // Handle cases where the string might be wrapped in extra single or double quotes from the UI/env
        if ((saString.startsWith("'") && saString.endsWith("'")) || 
            (saString.startsWith('"') && saString.endsWith('"'))) {
          saString = saString.substring(1, saString.length - 1).trim();
        }

        // Try to find the actual JSON object if there's surrounding text
        const firstBrace = saString.indexOf('{');
        const lastBrace = saString.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          saString = saString.substring(firstBrace, lastBrace + 1);
        }

        // Fix common JSON issues (missing quotes around keys, etc.)
        try {
          const serviceAccount = JSON.parse(saString);
          console.log('Initializing with FIREBASE_SERVICE_ACCOUNT env var for project:', serviceAccount.project_id);
          return initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id
          });
        } catch (jsonError) {
          console.warn('Standard JSON parse failed, attempting to fix formatting...');
          let fixedSa = saString.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
          fixedSa = fixedSa.replace(/'/g, '"');
          const serviceAccount = JSON.parse(fixedSa);
          return initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id
          });
        }
      } catch (e) {
        console.error('CRITICAL: Failed to parse FIREBASE_SERVICE_ACCOUNT:', e);
      }
    }
    
    // 2. Check for Google Application Credentials (ADC file)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('Initializing with GOOGLE_APPLICATION_CREDENTIALS file');
      return initializeApp({
        projectId: projectId
      });
    }
    
    // 3. Try to initialize with the project ID explicitly
    if (projectId) {
      console.log('Initializing with explicit project ID:', projectId);
      return initializeApp({
        projectId: projectId,
      });
    }

    // 4. Final Fallback: Try default initialization
    console.log('Attempting default initialization...');
    return initializeApp();
  } catch (error: any) {
    console.error('CRITICAL: Firebase Admin initialization failed:', error);
    throw error;
  }
};

let adminApp: any;
try {
  adminApp = initializeAdmin();
} catch (e) {
  console.error('Fatal Firebase Admin Error:', e);
}

// Initialize Firestore and Auth
const dbId = firebaseConfig.firestoreDatabaseId;
console.log('Firestore Database ID to use:', dbId || '(default)');

let dbInstance: any = null;
let authInstance: any = null;

if (adminApp) {
  try {
    // Try to initialize with the named database first
    if (dbId && dbId !== '(default)') {
      try {
        console.log('Initializing Firestore with named database:', dbId);
        dbInstance = getFirestore(adminApp, dbId);
      } catch (dbError: any) {
        console.error(`Failed to initialize named database "${dbId}", falling back to default:`, dbError.message);
        dbInstance = getFirestore(adminApp);
      }
    } else {
      console.log('Initializing Firestore with default database');
      dbInstance = getFirestore(adminApp);
    }
    authInstance = getAuth(adminApp);
    console.log('Firestore and Auth instances initialized successfully');
  } catch (error: any) {
    console.error('Failed to initialize Firestore/Auth:', error.message);
    try {
      // Final fallback to default database
      dbInstance = getFirestore(adminApp);
      authInstance = getAuth(adminApp);
    } catch (f) {
      console.error('Final fallback failed:', f);
    }
  }
}

// Error handling for Firestore operations
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export const handleFirestoreError = (error: any, operationType: OperationType, path: string | null) => {
  const errInfo = {
    error: error.message || String(error),
    code: error.code,
    operationType,
    path,
    projectId: projectId,
    databaseId: dbId || '(default)',
    hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT
  };
  
  console.error('Firestore Error Details:', JSON.stringify(errInfo, null, 2));
  
  if (error.code === 7 || error.message?.includes('PERMISSION_DENIED')) {
    const fixInstructions = `
      HOW TO FIX PERMISSION_DENIED:
      1. Go to Google Cloud Console: https://console.cloud.google.com/iam-admin/iam?project=${projectId}
      2. Find the Service Account: ${process.env.FIREBASE_SERVICE_ACCOUNT ? 'The one you provided in settings' : 'The default compute service account'}
      3. Add the role: "Firebase Admin" or "Cloud Datastore User"
      4. Ensure you are using the correct Database ID: ${dbId || '(default)'}
    `;
    console.error(fixInstructions);
    throw new Error(`Firebase Permission Denied for project ${projectId}. Please check IAM roles in Google Cloud Console.`);
  }
  
  throw error;
};

export const getDb = () => {
  if (!dbInstance) {
    throw new Error('Firestore is not initialized. Check server logs for Firebase Admin errors.');
  }
  return dbInstance;
};

// Helper to test if we can actually read from Firestore
export const testFirestoreConnection = async () => {
  try {
    const db = getDb();
    console.log('Testing Firestore connection to database:', dbId || '(default)');
    // Try to read a non-existent doc just to check permissions
    const docRef = db.collection('_health_check_').doc('ping');
    await docRef.get();
    return { 
      success: true, 
      projectId, 
      databaseId: dbId || '(default)',
      usingServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT
    };
  } catch (error: any) {
    console.error('Firestore connection test failed:', error.message);
    return { 
      success: false, 
      error: error.message, 
      code: error.code,
      projectId,
      databaseId: dbId || '(default)',
      details: 'If code is 7, check if your Service Account has permissions for this specific database.'
    };
  }
};

export const getAuthInstance = () => {
  if (!authInstance) {
    throw new Error('Firebase Auth is not initialized. Check server logs for Firebase Admin errors.');
  }
  return authInstance;
};

// Keep these for backward compatibility but they might be null if init failed
export const db = dbInstance;
export const auth = authInstance;
