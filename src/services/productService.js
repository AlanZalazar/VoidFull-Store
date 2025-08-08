// src/services/productService.js
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export const updateProductStatus = async (productId, active) => {
  try {
    await setDoc(
      doc(db, "products", productId),
      {
        active: active,
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error("Error updating product status:", error);
    return { success: false, error: error.message };
  }
};
