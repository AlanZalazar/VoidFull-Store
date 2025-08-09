import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserPopupRedirectResolver,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const auth = getAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateUserData = async (firebaseUser) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? userDoc.data() : null;
  };

  const loginWithEmail = async (email, password) => {
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await user.getIdTokenResult(true);
      await updateUserData(user);
      navigate("/");
      return true;
    } catch (err) {
      handleAuthError(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setError("");
    setLoading(true);

    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();

      // Configuración para evitar problemas de políticas
      provider.setCustomParameters({
        prompt: "select_account",
        display: "popup",
      });

      // Detectar si el navegador bloquea popups
      const isPopupBlocked = () => {
        const popup = window.open("", "_blank");
        if (popup === null || typeof popup === "undefined") {
          return true;
        }
        popup.close();
        return false;
      };

      if (isPopupBlocked()) {
        // Usar redirección si los popups están bloqueados
        await signInWithRedirect(auth, provider);
        const result = await getRedirectResult(
          auth,
          browserPopupRedirectResolver
        );
        if (result) {
          await updateUserData(result.user);
          navigate("/");
        }
      } else {
        // Usar popup si está permitido
        const result = await signInWithPopup(
          auth,
          provider,
          browserPopupRedirectResolver
        );
        await updateUserData(result.user);
        navigate("/");
      }

      return true;
    } catch (err) {
      let errorMessage = "Error al conectar con Google";

      if (err.code === "auth/popup-blocked") {
        errorMessage = "Por favor permite ventanas emergentes para este sitio";
      } else if (err.code === "auth/popup-closed-by-user") {
        errorMessage = "Ventana de inicio de sesión cerrada antes de completar";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Problema de conexión. Verifica tu internet";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Método de autenticación no habilitado";
      } else if (err.code === "auth/cancelled-popup-request") {
        errorMessage = "Solicitud cancelada. Intenta nuevamente";
      } else {
        console.error("Error Google Auth:", err.code, err.message);
      }

      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (error) => {
    let errorMessage = "Ocurrió un error al iniciar sesión";

    switch (error.code) {
      case "auth/invalid-email":
        errorMessage = "El correo electrónico no es válido";
        break;
      case "auth/user-disabled":
        errorMessage = "Esta cuenta ha sido deshabilitada";
        break;
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential": // Nuevo caso agregado
        errorMessage = "Correo o contraseña incorrectos";
        break;
      case "auth/too-many-requests":
        errorMessage = "Demasiados intentos fallidos. Intenta más tarde";
        break;
      case "auth/popup-closed-by-user":
        errorMessage =
          "Te arrepentiste de ingresar con Google? Ingresa con Email y contraseña";
        break;
      default:
        console.error("Error de autenticación:", error.code, error.message);
        errorMessage = error.message || errorMessage;
    }

    setError(errorMessage);
  };

  const value = {
    error,
    loading,
    loginWithEmail,
    loginWithGoogle,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
