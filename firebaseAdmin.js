import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0Aqz4Rt0FFGNqTSsxK5hEX2n6cTgPTD4",
  authDomain: "voidfull-web.firebaseapp.com",
  projectId: "voidfull-web",
  storageBucket: "voidfull-web.firebasestorage.app",
  messagingSenderId: "84919617751",
  appId: "1:84919617751:web:94421ae4eadab184f80892",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
