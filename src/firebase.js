import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore'

// Replace these values with your Firebase web app config from the README.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

let db
let authReady = Promise.resolve(false)
if (Object.values(firebaseConfig).every(Boolean)) {
  const app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  authReady = signInAnonymously(getAuth(app)).then(() => true).catch(() => false)
}

export function subscribeToReactions(mediaId, callback) {
  if (!db) return () => {}
  return onSnapshot(doc(db, 'reactions', mediaId), (snap) => callback(snap.exists() ? snap.data() : {}))
}

export async function saveReaction(mediaId, emoji) {
  await authReady
  if (!db) return
  return setDoc(doc(db, 'reactions', mediaId), { emoji, updatedAt: Date.now() })
}
