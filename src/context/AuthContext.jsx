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

  // Observador de estado de autenticación
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
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false); // ya sabemos si hay usuario o no
    });

    return () => unsubscribe();
  }, []);

  // Función logout
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error };
    }
  };

  // Actualizar datos del usuario desde Firestore
  const updateUserData = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
  };

  // Verificar rol del usuario
  const checkUserRole = async (email) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("email", "==", email.toLowerCase()),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return "customer";

      const userData = querySnapshot.docs[0].data();
      return userData.role || "customer";
    } catch (error) {
      console.error("Error verificando rol:", error);
      return "customer"; // Fallback seguro
    }
  };

  // Login con email y contraseña
  const loginWithEmail = async (email, password) => {
    setError("");
    setLoading(true);

    try {
      // 1. Intentar login primero
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Verificar rol después del login (con permisos)
      const idToken = await user.getIdTokenResult();
      if (idToken.claims.role === "admin") {
        await signOut(auth);
        throw new Error("Los administradores deben usar el panel especial");
      }

      // 3. Actualizar datos y redirigir
      await updateUserData(user);
      return true;
    } catch (error) {
      handleAuthError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login con Google
  const loginWithGoogle = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verificar rol
      const idToken = await user.getIdTokenResult();
      if (idToken.claims.role === "admin") {
        await signOut(auth);
        throw new Error("Los administradores deben usar el panel especial");
      }

      await updateUserData(user);
      return true;
    } catch (error) {
      handleAuthError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Manejo de errores
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

  // Función específica para login de admin con email
  const loginAdminWithEmail = async (email, password) => {
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Verificar rol en Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        await signOut(auth);
        throw new Error("Acceso restringido a administradores");
      }

      return user;
    } catch (error) {
      handleAuthError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Función específica para login de admin con Google
  const loginAdminWithGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verificar rol en Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        await signOut(auth);
        throw new Error("Acceso restringido a administradores");
      }

      return user;
    } catch (error) {
      handleAuthError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Proveer valores del contexto
  const value = {
    user, // <- Añade esto
    error,
    loading,
    authLoading,
    loginWithEmail,
    loginWithGoogle,
    logout, // <- Añade esto
    setError,
    loginAdminWithEmail,
    loginAdminWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
