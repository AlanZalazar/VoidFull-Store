// src/services/orders.js
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function createOrder(userId, items, total, paymentId) {
  try {
    const docRef = await addDoc(collection(db, "orders"), {
      userId,
      items,
      total,
      paymentId,
      status: "pending", // 👈 luego podrías actualizar a "paid"
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creando orden:", error);
    throw error;
  }
}
