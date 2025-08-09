import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const navigate = useNavigate();
  const { error, loading, loginWithEmail, loginWithGoogle, setError } =
    useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [shake, setShake] = useState(false);
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setError("Por favor completa todos los campos");
      return;
    }

    await loginWithEmail(formData.email, formData.password);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
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
          className="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-describedby="emailError"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
          className="border border-gray-300 p-3 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-describedby="passwordError"
        />
      </div>

      {error && (
        <p
          id="formError"
          className="text-red-600 bg-red-100 border border-red-400 p-3 rounded-md text-center animate-[fade-in_0.3s_ease-out]"
          role="alert"
          aria-live="assertive"
        >
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
