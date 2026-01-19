import admin from 'firebase-admin';

let firebaseInitialized = false;

export function initializeFirebaseAdmin(): boolean {
  if (firebaseInitialized) return true;
  
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountJson) {
      console.warn('FIREBASE_SERVICE_ACCOUNT not set - Firebase features disabled');
      return false;
    }
    
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    
    firebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return false;
  }
}

export function getFirestore() {
  if (!firebaseInitialized) {
    initializeFirebaseAdmin();
  }
  return admin.firestore();
}

export { admin };
