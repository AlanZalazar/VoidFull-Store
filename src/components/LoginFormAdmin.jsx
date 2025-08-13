import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginFormAdmin() {
  const [emailError, setEmailError] = useState("");
  const [adminError, setAdminError] = useState("");
  const navigate = useNavigate();
  const {
    error,
    loading,
    loginAdminWithEmail,
    loginAdminWithGoogle,
    setError,
  } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [shake, setShake] = useState(false);
  const formRef = useRef(null);

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

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setAdminError("");

    // Validación de campos vacíos
    if (!formData.email || !formData.password) {
      setAdminError("Completa todos los campos");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    // Validación de formato de email
    if (emailError) {
      setAdminError("Correo electrónico inválido");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    try {
      const user = await loginAdminWithEmail(formData.email, formData.password);
      if (user) {
        navigate("/admin");
      }
    } catch (error) {
      setAdminError(error.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleAdminGoogleLogin = async () => {
    try {
      const user = await loginAdminWithGoogle();
      if (user) {
        navigate("/admin");
      }
    } catch (error) {
      setAdminError(error.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleAdminLogin}
      className={`bg-white p-8 max-w-sm mx-auto rounded-xl shadow-lg space-y-5 ${
        shake ? "animate-[shake_0.5s_cubic-bezier(.36,.07,.19,.97)_both]" : ""
      }`}
      noValidate
    >
      <h2 className="text-2xl font-bold text-center text-gray-800">
        Acceso Administrativo
      </h2>

      <div className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="Correo administrativo"
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
          placeholder="Contraseña administrativa"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
          className="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-describedby="passwordError"
        />
      </div>

      {error && (
        <p className="text-red-600 bg-red-100 border border-red-400 p-3 rounded-md text-center">
          {error}
        </p>
      )}

      {adminError && (
        <p className="text-red-600 bg-red-100 border border-red-400 p-3 rounded-md text-center">
          {adminError}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 w-full text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Verificando credenciales..." : "Acceder al Panel Admin"}
      </button>

      <div className="text-center text-gray-400 text-sm">o</div>

      <button
        type="button"
        onClick={handleAdminGoogleLogin}
        disabled={loading}
        className="w-full border border-gray-300 py-2 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-gray-50 transition disabled:opacity-50"
      >
        <img src="/logoogle.png" alt="Google logo" className="w-5 h-5" />
        {loading ? "Conectando..." : "Acceso con Google (Admin)"}
      </button>

      <div className="text-center text-sm text-gray-600 mt-4">
        ¿No tienes acceso administrativo?{" "}
        <button
          type="button"
          onClick={() => navigate("/contacto-soporte")}
          className="text-blue-600 hover:underline"
        >
          Solicitar acceso
        </button>
      </div>
    </form>
  );
}
