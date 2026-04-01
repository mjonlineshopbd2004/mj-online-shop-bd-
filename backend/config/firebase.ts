import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

// Load firebase config manually to avoid ESM import issues with JSON
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));

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
          credential: cert(serviceAccount),
          projectId: serviceAccount.project_id
        });
      } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT as JSON:', e);
      }
    }
    
    // 2. Check for Google Application Credentials (ADC file)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('Initializing Firebase Admin with GOOGLE_APPLICATION_CREDENTIALS');
      return initializeApp();
    }
    
    // 3. Fallback: Try to initialize with just the project ID (ADC ambient/metadata server)
    // This is the standard way for Cloud Run/Functions
    if (firebaseConfig.projectId) {
      console.log('Initializing Firebase Admin with project ID (Ambient ADC):', firebaseConfig.projectId);
      return initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }

    // 4. Last resort fallback: Check for Google Drive service account credentials
    // We do this last because this service account might have limited scopes (e.g. only Drive)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      try {
        let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.trim().replace(/^["']|["']$/g, '');
        privateKey = privateKey.replace(/\\n/g, '\n');

        // Ensure proper PEM format
        if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
          const base64 = privateKey.replace(/\s/g, '');
          const wrappedBase64 = base64.match(/.{1,64}/g)?.join('\n') || base64;
          privateKey = `-----BEGIN PRIVATE KEY-----\n${wrappedBase64}\n-----END PRIVATE KEY-----\n`;
        }

        console.log('Initializing Firebase Admin with Google Drive service account credentials (Fallback)');
        return initializeApp({
          credential: cert({
            clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            privateKey: privateKey,
            projectId: firebaseConfig.projectId
          }),
          projectId: firebaseConfig.projectId
        });
      } catch (e) {
        console.error('Failed to initialize Firebase Admin with Google Drive credentials:', e);
      }
    }
    
    console.log('Initializing Firebase Admin with default config (Final Fallback)');
    return initializeApp();
  } catch (error: any) {
    console.error('CRITICAL: Firebase Admin initialization failed:', error);
    return null as any;
  }
};

const adminApp = initializeAdmin();

// Initialize Firestore and Auth
const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
console.log('Attempting to use Firestore Database ID:', dbId);

let dbInstance: any = null;
let authInstance: any = null;

if (adminApp) {
  try {
    // For named databases, getFirestore takes (app, databaseId)
    dbInstance = getFirestore(adminApp, dbId);
    authInstance = getAuth(adminApp);
    console.log('Firestore and Auth instances initialized successfully with database ID:', dbId);
  } catch (error: any) {
    console.error('Failed to initialize Firestore with database ID:', dbId, error.message);
    try {
      dbInstance = getFirestore(adminApp);
      authInstance = getAuth(adminApp);
      console.log('Fallback: Firestore and Auth initialized with default database');
    } catch (fallbackError: any) {
      console.error('Failed to initialize Firestore with default database:', fallbackError.message);
    }
  }
} else {
  console.error('Firebase Admin App not initialized, cannot create Firestore/Auth instances');
}

export const db = dbInstance;
export const auth = authInstance;
