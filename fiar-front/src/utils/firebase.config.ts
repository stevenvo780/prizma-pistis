import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import 'firebase/compat/database';
import { initializeApp } from 'firebase/app';
import { getAuth, EmailAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

export { auth, EmailAuthProvider };
export const compatAuth = firebase.auth();
export const providers = {
  google: new firebase.auth.GoogleAuthProvider(),
  apple: new firebase.auth.OAuthProvider('apple.com'),
  facebook: new firebase.auth.FacebookAuthProvider(),
  microsoft: new firebase.auth.OAuthProvider('microsoft.com'),
};
export const firestore = firebase.firestore();
export const storage = firebase.storage();
export const database = firebase.database();

export type ProviderName = keyof typeof providers;
