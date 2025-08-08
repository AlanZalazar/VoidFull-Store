// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateUserData = async (firebaseUser, additionalData = {}) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || "",
        firstName: firebaseUser.displayName?.split(" ")[0] || "",
        lastName: firebaseUser.displayName?.split(" ")[1] || "",
        role: "customer",
        createdAt: new Date(),
        phone: "",
        address: {
          street: "",
          city: "",
          province: "",
          postalCode: "",
          floor: "",
          reference: "",
          deliveryNotes: "",
        },
        ...additionalData,
      };

      await setDoc(userRef, userData);
      return userData;
    } else {
      return userDoc.data();
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userData = await updateUserData(firebaseUser);
          setUser({ ...userData });
        } else {
          setUser(null);
        }
        // Remueve esta línea para no limpiar errores:
        // setError(null);
      } catch (err) {
        console.error("Error updating user data:", err);
        // setError(err.message); // Opcional: mantener o quitar
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Obtener el ID token para refrescar los custom claims
      await user.getIdTokenResult(true); // Force refresh

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      return {
        success: true,
        user: {
          ...user,
          ...userData,
          role: userData.role, // Esto ahora vendrá de tus custom claims
        },
      };
    } catch (err) {
      let errorMessage = "Ocurrió un error al iniciar sesión";

      // Traducción de errores comunes de Firebase
      switch (err.code) {
        case "auth/invalid-email":
          errorMessage = "El correo electrónico no es válido";
          break;
        case "auth/user-disabled":
          errorMessage = "Esta cuenta ha sido deshabilitada";
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
          errorMessage = "Correo o contraseña incorrectos";
          break;
        case "auth/too-many-requests":
          errorMessage = "Demasiados intentos fallidos. Intenta más tarde";
          break;
      }

      return {
        success: false,
        error: errorMessage,
        code: err.code, // Opcional: mantener el código original
      };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userData = await updateUserData(result.user);
      setUser({ ...result.user, ...userData });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, userData) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const completeUserData = await updateUserData(userCredential.user, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        address: {
          street: userData.street,
          floor: userData.floor,
          city: userData.city,
          province: userData.province,
          postalCode: userData.postalCode,
          reference: userData.reference,
          deliveryNotes: userData.deliveryNotes,
        },
        dni: userData.dni,
        displayName: `${userData.firstName} ${userData.lastName}`,
      });
      setUser({ ...userCredential.user, ...completeUserData });
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
