import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function RegisterForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    dni: "",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
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

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCred.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        dni: form.dni,
        role: "customer",
        createdAt: new Date(),
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          province: form.province,
          postalCode: form.postalCode,
        },
      });

      alert("✅ Cuenta creada con éxito. Ahora podés iniciar sesión.");
    } catch (err) {
      console.error(err);
      setError("No se pudo crear la cuenta: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="max-w-md mx-auto p-6 bg-white rounded shadow"
    >
      <h2 className="text-2xl font-bold mb-4">Crear cuenta</h2>

      <div className="grid grid-cols-2 gap-4">
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
        className="w-full mt-3 p-2 border rounded"
      />
      <input
        name="dni"
        placeholder="DNI"
        value={form.dni}
        onChange={handleChange}
        required
        className="w-full mt-3 p-2 border rounded"
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={handleChange}
        required
        className="w-full mt-3 p-2 border rounded"
      />
      <input
        name="phone"
        placeholder="Teléfono"
        value={form.phone}
        onChange={handleChange}
        required
        className="w-full mt-3 p-2 border rounded"
      />

      <input
        name="street"
        placeholder="Calle y número"
        value={form.street}
        onChange={handleChange}
        required
        className="w-full mt-3 p-2 border rounded"
      />
      <input
        name="city"
        placeholder="Ciudad"
        value={form.city}
        onChange={handleChange}
        required
        className="w-full mt-3 p-2 border rounded"
      />
      <input
        name="province"
        placeholder="Provincia"
        value={form.province}
        onChange={handleChange}
        required
        className="w-full mt-3 p-2 border rounded"
      />
      <input
        name="postalCode"
        placeholder="Código Postal"
        value={form.postalCode}
        onChange={handleChange}
        required
        className="w-full mt-3 p-2 border rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-4 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creando..." : "Registrarse"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}

export default RegisterForm;
