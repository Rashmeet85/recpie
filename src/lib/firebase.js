import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyChTONAiosUjCw4s6cDxejZQBFwXeXTlv4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'recipiebookjs.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'recipiebookjs',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'recipiebookjs.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '993845626443',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:993845626443:web:864863c3f7905622772fce',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-2YE0G5S6LX',
}

const app = initializeApp(firebaseConfig)

isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app)
  }
}).catch(() => null)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
  prompt: 'select_account',
})
