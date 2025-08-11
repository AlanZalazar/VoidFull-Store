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
  const [hasSynced, setHasSynced] = useState(false); // Nueva bandera de sincronización

  // Función para mezclar carritos sin duplicados
  const mergeCarts = (localCart, firebaseCart) => {
    const merged = [...firebaseCart];

    localCart.forEach((localItem) => {
      const existingIndex = merged.findIndex(
        (item) => item.id === localItem.id
      );
      if (existingIndex >= 0) {
        // Suma las cantidades si el producto ya existe
        merged[existingIndex].quantity += localItem.quantity;
      } else {
        // Agrega el producto si no existe
        merged.push(localItem);
      }
    });

    return merged;
  };

  // Cargar y sincronizar carrito
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];

        if (user) {
          const userCartRef = doc(db, "carts", user.uid);
          const userCartSnap = await getDoc(userCartRef);
          let firebaseCart = [];

          if (userCartSnap.exists()) {
            firebaseCart = userCartSnap.data().items || [];
          }

          // Solo sincroniza si no se ha hecho antes
          if (!hasSynced && localCart.length > 0) {
            const mergedCart = mergeCarts(localCart, firebaseCart);
            setCartItems(mergedCart);
            await setDoc(userCartRef, { items: mergedCart });
            localStorage.removeItem("cart");
            setHasSynced(true); // Marca como sincronizado
          } else {
            setCartItems(firebaseCart);
          }
        } else {
          setCartItems(localCart);
        }
      } catch (error) {
        console.error("Error syncing cart:", error);
      } finally {
        setIsLoaded(true);
      }
    });

    return unsubscribe;
  }, [hasSynced]);

  // Persistir cambios
  useEffect(() => {
    if (!isLoaded) return;

    const saveCart = async () => {
      try {
        if (auth.currentUser) {
          const userCartRef = doc(db, "carts", auth.currentUser.uid);
          await setDoc(userCartRef, { items: cartItems });
        } else {
          localStorage.setItem("cart", JSON.stringify(cartItems));
        }
      } catch (error) {
        console.error("Error saving cart:", error);
      }
    };

    saveCart();
  }, [cartItems, isLoaded]);

  // 3. Funciones del carrito
  const addToCart = useCallback(async (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      let newItems;

      if (existingItem) {
        newItems = prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...prevItems, { ...product, quantity: 1 }];
      }

      return newItems;
    });
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  }, []);

  const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, Math.floor(newQuantity)) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(async () => {
    setCartItems([]);
  }, []);

  // 4. Valores calculados
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
        clearCart: async () => {
          setCartItems([]);
          if (auth.currentUser) {
            const userCartRef = doc(db, "carts", auth.currentUser.uid);
            await setDoc(userCartRef, { items: [] });
          }
          localStorage.removeItem("cart");
        },
        cartTotal: cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
        itemCount: cartItems.reduce((count, item) => count + item.quantity, 0),
        isCartLoaded: isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
