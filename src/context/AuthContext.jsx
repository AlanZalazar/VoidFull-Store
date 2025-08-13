import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  limit,
  arrayUnion,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const auth = getAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 🔹 Actualizar datos del usuario desde Firestore
  const updateUserData = async (firebaseUser) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  };

  // 🔹 Fusionar favoritos locales con los de Firestore
  const mergeFavorites = async (firebaseUser) => {
    const localFavs = JSON.parse(localStorage.getItem("favorites") || "[]");

    const userRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const firestoreFavs = snap.data().favorites || [];
      const merged = [...new Set([...firestoreFavs, ...localFavs])];

      if (merged.length !== firestoreFavs.length) {
        await updateDoc(userRef, { favorites: merged });
      }

      localStorage.removeItem("favorites");
      return merged;
    }

    return localFavs;
  };

  // 🔹 Observador de estado de autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdTokenResult();
        const userData = await updateUserData(firebaseUser);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || userData?.name || "",
          role: token.claims.role || userData?.role || "customer",
          favorites: userData?.favorites || [],
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Login con email y contraseña
  const loginWithEmail = async (email, password) => {
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      const idToken = await firebaseUser.getIdTokenResult();
      if (idToken.claims.role === "admin") {
        await signOut(auth);
        throw new Error("Los administradores deben usar el panel especial");
      }

      const mergedFavs = await mergeFavorites(firebaseUser);
      const userData = await updateUserData(firebaseUser);

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || userData?.name || "",
        role: idToken.claims.role || userData?.role || "customer",
        favorites: mergedFavs,
      });

      return true;
    } catch (error) {
      handleAuthError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Login con Google
  const loginWithGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const idToken = await firebaseUser.getIdTokenResult();
      if (idToken.claims.role === "admin") {
        await signOut(auth);
        throw new Error("Los administradores deben usar el panel especial");
      }

      const mergedFavs = await mergeFavorites(firebaseUser);
      const userData = await updateUserData(firebaseUser);

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || userData?.name || "",
        role: idToken.claims.role || userData?.role || "customer",
        favorites: mergedFavs,
      });

      return true;
    } catch (error) {
      handleAuthError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error };
    }
  };

  // 🔹 Manejo de errores
  const handleAuthError = (error) => {
    let errorMessage = "Error al iniciar sesión";
    switch (error.code) {
      case "auth/invalid-email":
        errorMessage = "Email inválido";
        break;
      case "auth/user-not-found":
      case "auth/wrong-password":
        errorMessage = "Credenciales incorrectas";
        break;
      case "auth/too-many-requests":
        errorMessage = "Demasiados intentos. Intenta más tarde";
        break;
      default:
        errorMessage = error.message || errorMessage;
    }
    setError(errorMessage);
  };

  const value = {
    user,
    error,
    loading,
    authLoading,
    loginWithEmail,
    loginWithGoogle,
    logout,
    setError,
    setUser, // 🔹 para actualizar favoritos en tiempo real
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
