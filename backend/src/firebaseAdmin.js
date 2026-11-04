import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!raw) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is missing from backend/.env');
}

let serviceAccount;

try {
  serviceAccount = JSON.parse(raw);
} catch {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must contain valid JSON.');
}

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id
    });

export const db = getFirestore(app);
export const authAdmin = getAuth(app);
export { FieldValue };