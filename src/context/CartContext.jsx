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
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  const mergeCarts = useCallback((localCart, firebaseCart) => {
    const merged = [...firebaseCart];
    localCart.forEach((localItem) => {
      const index = merged.findIndex((item) => item.id === localItem.id);
      if (index >= 0) {
        merged[index].quantity += localItem.quantity;
      } else {
        merged.push(localItem);
      }
    });
    return merged;
  }, []);

  // Cargar carrito
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        if (user) {
          const userCartRef = doc(db, "carts", user.uid);
          const snap = await getDoc(userCartRef);
          const firebaseCart = snap.exists() ? snap.data().items || [] : [];
          if (!hasSynced && localCart.length > 0) {
            const merged = mergeCarts(localCart, firebaseCart);
            setCartItems(merged);
            await setDoc(userCartRef, { items: merged });
            localStorage.removeItem("cart");
            setHasSynced(true);
          } else {
            setCartItems(firebaseCart);
          }
        } else {
          setCartItems(localCart);
        }
      } catch (err) {
        console.error("Error syncing cart:", err);
      } finally {
        setIsLoaded(true);
      }
    });
    return unsubscribe;
  }, [hasSynced, mergeCarts]);

  // Guardar cambios
  useEffect(() => {
    if (!isLoaded) return;
    const saveCart = async () => {
      try {
        if (auth.currentUser) {
          const ref = doc(db, "carts", auth.currentUser.uid);
          await setDoc(ref, { items: cartItems });
        } else {
          localStorage.setItem("cart", JSON.stringify(cartItems));
        }
      } catch (err) {
        console.error("Error saving cart:", err);
      }
    };
    saveCart();
  }, [cartItems, isLoaded]);

  const addToCart = useCallback((product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id, qty) => {
    if (qty < 1) return;
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, Math.floor(qty)) } : i
      )
    );
  }, []);

  const clearCart = useCallback(async () => {
    setCartItems([]);
    if (auth.currentUser) {
      const ref = doc(db, "carts", auth.currentUser.uid);
      await setDoc(ref, { items: [] });
    }
    localStorage.removeItem("cart");
  }, []);

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        isCartLoaded: isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  return useContext(CartContext);
};
