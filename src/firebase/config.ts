import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBJ00WTQdYliQlgjIOXJsn27XqBcevjgP0",
    authDomain: "sales-management-system-codey.firebaseapp.com",
    projectId: "sales-management-system-codey",
    storageBucket: "sales-management-system-codey.firebasestorage.app",
    messagingSenderId: "413957716418",
    appId: "1:413957716418:web:9b6c1f09afb54dfaf4be5b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);

// Configurar autenticación con persistencia local
const auth = getAuth(app);

// Configurar persistencia de autenticación
// setPersistence(auth, browserLocalPersistence)
//   .catch((error) => {
//     console.error('Error al configurar la persistencia de autenticación:', error);
//   });

export async function initAuth() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.error('Error al configurar la persistencia de autenticación:', error);
  }
}

export { auth };