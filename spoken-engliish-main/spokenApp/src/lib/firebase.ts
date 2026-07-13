import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'REPLACE_WITH_FIREBASE_API_KEY',
  authDomain: 'spoken-english-4f507.firebaseapp.com',
  projectId: 'spoken-english-4f507',
  storageBucket: 'spoken-english-4f507.firebasestorage.app',
  messagingSenderId: 'REPLACE_WITH_SENDER_ID',
  appId: 'REPLACE_WITH_APP_ID',
  measurementId: 'REPLACE_WITH_MEASUREMENT_ID',
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const analytics = isSupported().then((yes) => yes ? getAnalytics(app) : null);
