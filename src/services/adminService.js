import { getDocs, collection, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

// Obtener todos los usuarios
export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
}

// Eliminar un usuario
export async function deleteUser(uid) {
  await deleteDoc(doc(db, "users", uid));
}
