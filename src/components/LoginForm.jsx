import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Por favor completa todos los campos");
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      const res = await login(formData.email, formData.password);

      if (res.success) {
        // Redirigir según el rol del usuario
        if (res.user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setError(res.error || "Correo o contraseña incorrectos.");
        triggerShake();
      }
    } catch (err) {
      setError("Ocurrió un error inesperado. Intentá nuevamente.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await loginWithGoogle();
      if (res.success) {
        // Redirigir según el rol del usuario
        if (res.user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setError(res.error || "No se pudo iniciar sesión con Google.");
      }
    } catch (err) {
      setError("Ocurrió un error al conectar con Google.");
    } finally {
      setLoading(false);
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
      onSubmit={handleLogin}
      className={`bg-white p-8 max-w-sm mx-auto rounded-xl shadow-lg space-y-5 ${
        shake ? "animate-[shake_0.5s_cubic-bezier(.36,.07,.19,.97)_both]" : ""
      }`}
      noValidate
    >
      <h2 className="text-3xl font-bold text-center text-gray-800">
        Iniciar sesión
      </h2>

      <div className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          required
          className="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          className="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center animate-[fade-in_0.3s_ease-out]">
          {error}
        </p>
      )}

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
