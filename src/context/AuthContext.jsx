import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
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

  // 1. Observador de estado de autenticación
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdTokenResult();
        const userData = await getUserData(firebaseUser.uid);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || userData?.name || "",
          photoURL: firebaseUser.photoURL || userData?.photoURL || "",
          role: token.claims.role || userData?.role || "customer",
          favorites: userData?.favorites || [],
          cart: userData?.cart || [],
        });

        // Fusionar favoritos locales con los de Firestore
        await mergeLocalData(firebaseUser.uid);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Obtener datos del usuario desde Firestore
  const getUserData = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
  };

  // 3. Fusionar datos locales con Firestore
  const mergeLocalData = async (uid) => {
    const localFavs = JSON.parse(localStorage.getItem("favorites") || "[]");
    const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

    if (localFavs.length > 0 || localCart.length > 0) {
      const userRef = doc(db, "users", uid);
      const updates = {};

      if (localFavs.length > 0) {
        updates.favorites = arrayUnion(...localFavs);
      }

      if (localCart.length > 0) {
        updates.cart = arrayUnion(...localCart);
      }

      await updateDoc(userRef, updates);
      localStorage.removeItem("favorites");
      localStorage.removeItem("cart");
    }
  };

  // 4. Registro de usuarios
  const register = async (email, password, { name, dni, phone }) => {
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Actualizar perfil en Firebase Auth
      await updateProfile(firebaseUser, { displayName: name });

      // Crear documento en Firestore
      const userRef = doc(db, "users", firebaseUser.uid);
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name,
        dni,
        phone,
        role: "customer",
        favorites: [],
        cart: [],
        createdAt: new Date(),
      });

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: name,
        dni,
        phone,
        role: "customer",
        favorites: [],
        cart: [],
      });

      return { success: true };
    } catch (error) {
      handleAuthError(error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // 5. Login para usuarios normales
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

      // Verificar que no sea admin intentando entrar por la puerta normal
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        await signOut(auth);
        throw new Error("Los administradores deben usar el panel especial");
      }

      // Fusionar datos locales
      await mergeLocalData(firebaseUser.uid);
      return true;
    } catch (error) {
      handleAuthError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 6. Login con Google para usuarios normales
  const loginWithGoogle = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Verificar si es un usuario existente
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        // Crear nuevo usuario en Firestore
        await setDoc(doc(db, "users", firebaseUser.uid), {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || "",
          photoURL: firebaseUser.photoURL || "",
          role: "customer",
          favorites: [],
          cart: [],
          createdAt: new Date(),
        });
      } else if (userDoc.data().role === "admin") {
        await signOut(auth);
        throw new Error("Los administradores deben usar el panel especial");
      }

      // Fusionar datos locales
      await mergeLocalData(firebaseUser.uid);
      return true;
    } catch (error) {
      handleAuthError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 7. Login para administradores
  const loginAdminWithEmail = async (email, password) => {
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Verificar rol de administrador
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        await signOut(auth);
        throw new Error("Acceso restringido a administradores");
      }

      // Actualizar estado del usuario
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || userDoc.data().name || "",
        role: "admin",
        favorites: userDoc.data().favorites || [],
      });

      return true;
    } catch (error) {
      handleAuthError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 8. Login con Google para administradores
  const loginAdminWithGoogle = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Verificar rol de administrador
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        await signOut(auth);
        throw new Error("Acceso restringido a administradores");
      }

      // Actualizar estado del usuario
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || userDoc.data().name || "",
        role: "admin",
        favorites: userDoc.data().favorites || [],
      });

      return true;
    } catch (error) {
      handleAuthError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 9. Restablecer contraseña
  const resetPassword = async (email) => {
    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      handleAuthError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 10. Cerrar sesión
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

  // 11. Manejo de errores
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
      case "auth/email-already-in-use":
        errorMessage = "El email ya está registrado";
        break;
      case "auth/weak-password":
        errorMessage = "La contraseña debe tener al menos 6 caracteres";
        break;
      case "auth/operation-not-allowed":
        errorMessage = "Operación no permitida";
        break;
      default:
        errorMessage = error.message || errorMessage;
    }
    setError(errorMessage);
  };

  // 12. Proveer el contexto
  const value = {
    user,
    error,
    loading,
    authLoading,
    register,
    loginWithEmail,
    loginWithGoogle,
    loginAdminWithEmail,
    loginAdminWithGoogle,
    resetPassword,
    logout,
    setError,
    setUser,
    updateUserProfile: async (updates) => {
      try {
        await updateProfile(auth.currentUser, updates);
        setUser((prev) => ({ ...prev, ...updates }));

        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, updates);

        return true;
      } catch (error) {
        setError(error.message);
        return false;
      }
    },
    updateUserData: async (data) => {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, data);

        setUser((prev) => ({ ...prev, ...data }));
        return true;
      } catch (error) {
        setError(error.message);
        return false;
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
