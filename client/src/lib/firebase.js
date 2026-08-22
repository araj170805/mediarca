import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA6gVeMnJwbyyyXUPzb5fTlDT_CT5iq8ts',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mediarca-c70cf.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mediarca-c70cf',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mediarca-c70cf.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '503411739035',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:503411739035:web:9e91ca6ae1e85faee8f93e',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-0SHFV88C9H',
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
