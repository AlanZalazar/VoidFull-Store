import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const [emailError, setEmailError] = useState("");
  const [adminError, setAdminError] = useState("");
  const navigate = useNavigate();
  const { error, loading, loginWithEmail, loginWithGoogle, setError } =
    useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [shake, setShake] = useState(false);
  const formRef = useRef(null);

  // 🔹 Mapea códigos de error de Firebase a mensajes claros
  const mapFirebaseError = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "El correo no tiene un formato válido.";
      case "auth/user-not-found":
        return "No existe una cuenta con ese correo.";
      case "auth/wrong-password":
        return "La contraseña es incorrecta.";
      case "auth/too-many-requests":
        return "Demasiados intentos fallidos. Intenta más tarde.";
      case "auth/user-disabled":
        return "Esta cuenta ha sido deshabilitada.";
      default:
        return "Ocurrió un error al iniciar sesión.";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setEmailError(isValid ? "" : "Email inválido");
    }

    if (error) setError("");
    if (adminError) setAdminError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setAdminError("");

    if (!formData.email || !formData.password) {
      setError("Completa todos los campos");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    try {
      const success = await loginWithEmail(formData.email, formData.password);
      if (success) navigate("/");
    } catch (err) {
      if (err.message.includes("administradores")) {
        setAdminError(err.message);
      } else {
        setError(mapFirebaseError(err.code || ""));
      }
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const success = await loginWithGoogle();
      if (success) navigate("/");
    } catch (err) {
      if (err.message.includes("administradores")) {
        setAdminError(err.message);
      } else {
        setError(mapFirebaseError(err.code || ""));
      }
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleGuest = () => {
    navigate("/");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleLogin}
      className={`bg-white p-8 max-w-sm mx-auto rounded-xl shadow-lg space-y-5 ${
        shake ? "animate-[shake_0.5s_cubic-bezier(.36,.07,.19,.97)_both]" : ""
      }`}
      noValidate
    >
      <div className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          className={`border ${
            emailError ? "border-red-500" : "border-gray-300"
          } p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          aria-describedby="emailError"
        />
        {emailError && (
          <p id="emailError" className="text-red-500 text-sm mt-1">
            {emailError}
          </p>
        )}
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
          className="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <div className="text-red-500">{error}</div>}
      {adminError && <div className="text-red-500">{adminError}</div>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 w-full text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      <div className="text-center text-gray-400 text-sm">o</div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full border border-gray-300 py-2 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50 transition disabled:opacity-50"
      >
        <img src="./logoogle.png" alt="Google logo" className="w-5 h-5" />
        {loading ? "Conectando..." : "Iniciar sesión con Google"}
      </button>

      <button
        type="button"
        onClick={handleGuest}
        className="w-full text-sm text-gray-600 hover:underline mt-2"
      >
        Continuar como invitado
      </button>

      <div className="text-center text-sm text-gray-600 mt-4">
        ¿No tenés cuenta?{" "}
        <button
          type="button"
          onClick={handleRegister}
          className="text-blue-600 hover:underline"
        >
          Registrate
        </button>
      </div>
    </form>
  );
}
