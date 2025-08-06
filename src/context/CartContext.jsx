// src/context/CartContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar carrito de localStorage al inicio
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
    setIsLoaded(true);
  }, []);

  // Escuchar cambios de sesión
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const userCartRef = doc(db, "carts", user.uid);
        const userCartSnap = await getDoc(userCartRef);

        if (userCartSnap.exists()) {
          setCart(userCartSnap.data().items || []);
        } else {
          await setDoc(userCartRef, { items: [] });
        }

        localStorage.removeItem("cart");
      } catch (err) {
        console.error("Error cargando carrito del usuario:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    if (isLoaded && !auth.currentUser) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = useCallback(async (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const updated = existing
        ? prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prev, { ...product, quantity: 1 }];

      if (auth.currentUser) {
        const userCartRef = doc(db, "carts", auth.currentUser.uid);
        setDoc(userCartRef, { items: updated });
      }

      return updated;
    });
  }, []);

  const removeFromCart = useCallback(async (id) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.id !== id);

      if (auth.currentUser) {
        const userCartRef = doc(db, "carts", auth.currentUser.uid);
        setDoc(userCartRef, { items: updated });
      }

      return updated;
    });
  }, []);

  const clearCart = useCallback(async () => {
    setCart([]);
    if (auth.currentUser) {
      const userCartRef = doc(db, "carts", auth.currentUser.uid);
      await setDoc(userCartRef, { items: [] });
    }
    localStorage.removeItem("cart");
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, setCart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
