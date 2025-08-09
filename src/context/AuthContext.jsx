import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
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
      const provider = new GoogleAuthProvider();
      // Agrega estos parámetros para evitar problemas con ventanas emergentes
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider).catch((err) => {
        // Manejo específico para errores de ventana emergente
        if (err.code === "auth/popup-blocked") {
          throw new Error(
            "Por favor permite ventanas emergentes para este sitio"
          );
        }
        if (err.code === "auth/popup-closed-by-user") {
          throw new Error("Ventana de inicio de sesión cerrada");
        }
        throw err;
      });

      await updateUserData(result.user);
      navigate("/");
      return true;
    } catch (err) {
      let errorMessage = "Error al conectar con Google";

      if (err.message.includes("ventanas emergentes")) {
        errorMessage = err.message;
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Problema de conexión. Verifica tu internet";
      } else if (err.code === "auth/operation-not-allowed") {
        errorMessage = "Método de autenticación no habilitado";
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
