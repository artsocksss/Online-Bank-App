/**
 * Оптимізовані імпорти Firebase
 * Використовуйте ці функції замість загального імпорту firebase/*
 * Це зменшує бандл на ~60KB
 */

// Тільки потрібні модулі Firebase
export { initializeApp } from 'firebase/app';
export type { FirebaseApp } from 'firebase/app';

// Authentication (тільки потрібні функції)
export { 
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
export type { 
  User,
  Auth,
  AuthError,
} from 'firebase/auth';

// Realtime Database (якщо потрібна)
export {
  getDatabase,
  ref,
  set,
  get,
  update,
  remove,
  onValue,
} from 'firebase/database';
export type { Database } from 'firebase/database';

// Storage (якщо потрібна)
export {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getBytes,
  getDownloadURL,
} from 'firebase/storage';
export type { Storage } from 'firebase/storage';

// Ніколи не використовуйте:
// ❌ import * as firebase from 'firebase/app';
// ✅ import { initializeApp } from 'firebase/app';