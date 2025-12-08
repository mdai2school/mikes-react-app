// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA22FgX4aNnchI9nt5g1ebb8DES_vGl_iU",
  authDomain: "mikes-react-app-18323.firebaseapp.com",
  projectId: "mikes-react-app-18323",
  storageBucket: "mikes-react-app-18323.firebasestorage.app",
  messagingSenderId: "1034279684626",
  appId: "1:1034279684626:web:d1ed8290f8b49b6940a6cb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set persistence to local (saves login between sessions)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting persistence:', error);
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;

