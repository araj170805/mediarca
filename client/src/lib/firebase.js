import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAZWyi2UDWg7A5HQxmlqCM6ySvSX9LBlaE',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mediarca.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mediarca',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mediarca.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '629260030393',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:629260030393:web:5eac290b03b69a9f56e668',
};

function getClientAuth() {
  if (typeof window === 'undefined') return null;
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  return getAuth(app);
}

export async function signInWithGooglePopup() {
  const auth = getClientAuth();
  if (!auth) {
    throw new Error('Firebase Auth is only available in browser environment');
  }
  const googleProvider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return {
    user: result.user,
    idToken,
  };
}
