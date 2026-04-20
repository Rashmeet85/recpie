import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyChTONAiosUjCw4s6cDxejZQBFwXeXTlv4',
  authDomain: 'recipiebookjs.firebaseapp.com',
  projectId: 'recipiebookjs',
  storageBucket: 'recipiebookjs.firebasestorage.app',
  messagingSenderId: '993845626443',
  appId: '1:993845626443:web:864863c3f7905622772fce',
  measurementId: 'G-2YE0G5S6LX',
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
