import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAYN2e-Gc2EQc9rXVF3qF-mcee1Qd0mnko",
  authDomain: "void-full.firebaseapp.com",
  projectId: "void-full",
  storageBucket: "void-full.appspot.com",
  messagingSenderId: "568463431743",
  appId: "1:568463431743:web:ee214cd683f2ad573d808a",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };

export default app;
