// src/components/RegisterForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    dni: "",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    floor: "",
    city: "",
    province: "",
    postalCode: "",
    reference: "",
    deliveryNotes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { email, password, ...userData } = form;
    const res = await register(email, password, userData);
    if (res.success) navigate("/login", { state: { registered: true } });
    else setError("No se pudo crear la cuenta: " + res.error);
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleRegister}
      className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow space-y-4"
    >
      <h2 className="text-2xl font-bold text-center">Crear cuenta</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          name="firstName"
          placeholder="Nombre"
          value={form.firstName}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />
        <input
          name="lastName"
          placeholder="Apellido"
          value={form.lastName}
          onChange={handleChange}
          required
          className="p-2 border rounded"
        />
      </div>
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        name="dni"
        placeholder="DNI"
        value={form.dni}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        name="phone"
        placeholder="Teléfono"
        value={form.phone}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        name="street"
        placeholder="Calle y número"
        value={form.street}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        name="floor"
        placeholder="Piso / Departamento"
        value={form.floor}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <input
        name="city"
        placeholder="Ciudad"
        value={form.city}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        name="province"
        placeholder="Provincia"
        value={form.province}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        name="postalCode"
        placeholder="Código Postal"
        value={form.postalCode}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded"
      />
      <input
        name="reference"
        placeholder="Referencia (opcional)"
        value={form.reference}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <textarea
        name="deliveryNotes"
        placeholder="Instrucciones de entrega (opcional)"
        value={form.deliveryNotes}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Creando..." : "Registrarse"}
      </button>
    </form>
  );
}
