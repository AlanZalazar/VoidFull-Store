// CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Al montar, leer carrito del localStorage
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  // Guardar carrito en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Escuchar cambios de sesión y fusionar carritos
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userCartRef = doc(db, "carts", user.uid);
          const userCartSnap = await getDoc(userCartRef);

          const firestoreCart = userCartSnap.exists()
            ? userCartSnap.data().items || []
            : [];

          const localCart = JSON.parse(localStorage.getItem("cart")) || [];

          // Fusionar carritos
          const mergedCart = [...firestoreCart];
          localCart.forEach((localItem) => {
            const existing = mergedCart.find(
              (item) => item.id === localItem.id
            );
            if (existing) {
              existing.quantity += localItem.quantity;
            } else {
              mergedCart.push(localItem);
            }
          });

          setCart(mergedCart);

          // Guardar carrito fusionado en Firestore
          await setDoc(userCartRef, { items: mergedCart });

          // Limpiar localStorage (ya está en Firestore)
          localStorage.removeItem("cart");
        } catch (error) {
          console.error("❌ Error fusionando carrito:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const addToCart = async (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let updated;

      if (existing) {
        updated = prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updated = [...prev, { ...product, quantity: 1 }];
      }

      if (auth.currentUser) {
        const userCartRef = doc(db, "carts", auth.currentUser.uid);
        setDoc(userCartRef, { items: updated });
      }

      return updated;
    });
  };

  const removeFromCart = async (id) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.id !== id);

      if (auth.currentUser) {
        const userCartRef = doc(db, "carts", auth.currentUser.uid);
        setDoc(userCartRef, { items: updated });
      }

      return updated;
    });
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem("cart");

    if (auth.currentUser) {
      const userCartRef = doc(db, "carts", auth.currentUser.uid);
      await setDoc(userCartRef, { items: [] });
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
