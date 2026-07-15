import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyC8zQGohjdhtsYp5m7csc3hGrC7BcmgxUE',
  authDomain: 'spoken-english-4f507.firebaseapp.com',
  projectId: 'spoken-english-4f507',
  storageBucket: 'spoken-english-4f507.firebasestorage.app',
  messagingSenderId: '864828597512',
  appId: '1:864828597512:web:24e7446a8fc90e61ce78bd',
  measurementId: 'G-51N82JS09V',
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const analytics = isSupported().then((yes) => yes ? getAnalytics(app) : null);
