import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB0Aqz4Rt0FFGNqTSsxK5hEX2n6cTgPTD4",
  authDomain: "voidfull-web.firebaseapp.com",
  projectId: "voidfull-web",
  storageBucket: "voidfull-web.firebasestorage.app",
  messagingSenderId: "84919617751",
  appId: "1:84919617751:web:94421ae4eadab184f80892",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };

export default app;
