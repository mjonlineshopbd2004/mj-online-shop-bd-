import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// In this environment, we can initialize firebase-admin using the project ID
// since the container is already authenticated with the cloud project.
const adminApp = !getApps().length 
  ? initializeApp()
  : getApp();

export const db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(adminApp);
