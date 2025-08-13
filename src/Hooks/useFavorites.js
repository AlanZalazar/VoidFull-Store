import { useState, useEffect } from "react";
import { arrayUnion, arrayRemove, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export const useFavorites = () => {
  const { user } = useAuth();
  const [localFavorites, setLocalFavorites] = useState([]);

  // Cargar favoritos del localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) setLocalFavorites(JSON.parse(saved));
  }, []);

  // Sincronizar favoritos al loguearse
  useEffect(() => {
    if (user && localFavorites.length > 0) {
      syncFavoritesWithServer();
    }
  }, [user?.uid]);

  const syncFavoritesWithServer = async () => {
    try {
      // Agregar todos los favoritos locales al perfil del usuario
      await Promise.all(
        localFavorites.map((productId) =>
          updateDoc(doc(db, "products", productId), {
            favorites: arrayUnion(user.uid),
          })
        )
      );
      // Limpiar localStorage
      localStorage.removeItem("favorites");
      setLocalFavorites([]);
    } catch (error) {
      console.error("Error sincronizando favoritos:", error);
    }
  };

  const toggleFavorite = async (productId) => {
    if (!user) {
      // Modo offline - usar localStorage
      const newFavorites = localFavorites.includes(productId)
        ? localFavorites.filter((id) => id !== productId)
        : [...localFavorites, productId];

      setLocalFavorites(newFavorites);
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      return;
    }

    // Modo online - usar Firestore
    try {
      const productRef = doc(db, "products", productId);
      if (localFavorites.includes(productId)) {
        // Eliminar de favoritos
        await updateDoc(productRef, {
          favorites: arrayRemove(user.uid),
        });
        setLocalFavorites((prev) => prev.filter((id) => id !== productId));
      } else {
        // Agregar a favoritos
        await updateDoc(productRef, {
          favorites: arrayUnion(user.uid),
        });
        setLocalFavorites((prev) => [...prev, productId]);
      }
    } catch (error) {
      console.error("Error actualizando favoritos:", error);
    }
  };

  const isFavorite = (productId) => {
    return localFavorites.includes(productId);
  };

  return { toggleFavorite, isFavorite, localFavorites };
};
