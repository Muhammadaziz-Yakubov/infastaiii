import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCcbww3tx-gNva3tiSVN7xGo_6jOMfv4CA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "infast-ai-c3954.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "infast-ai-c3954",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "infast-ai-c3954.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "869423765598",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:869423765598:web:9504f27af2ca7024d27ccf",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-L0CK8LEKMV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Initialize Analytics (only in browser and if available)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.log('Analytics not available:', error.message);
  }
}

export { analytics };
export default app;
