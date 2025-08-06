// CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios de sesión
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (user) {
        const userCartRef = doc(db, "carts", user.uid);
        const snap = await getDoc(userCartRef);

        if (snap.exists()) {
          // Si ya existe carrito en Firestore -> usarlo
          setCart(snap.data().items || []);
        } else {
          // Si no existe, tomar el local y subirlo
          const localCart = JSON.parse(localStorage.getItem("cart")) || [];
          setCart(localCart);
          await setDoc(userCartRef, { items: localCart });
        }

        // Limpiar localStorage al loguearse
        localStorage.removeItem("cart");
      } else {
        // Usuario no logueado -> usar localStorage
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(localCart);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Guardar cambios en la fuente correspondiente
  useEffect(() => {
    if (loading) return;

    const user = auth.currentUser;
    if (user) {
      const userCartRef = doc(db, "carts", user.uid);
      setDoc(userCartRef, { items: cart });
    } else {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, loading]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      return existing
        ? prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = async () => {
    setCart([]);
    const user = auth.currentUser;
    if (user) {
      const userCartRef = doc(db, "carts", user.uid);
      await setDoc(userCartRef, { items: [] });
    } else {
      localStorage.removeItem("cart");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart }}
    >
      {!loading && children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
