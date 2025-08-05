// src/pages/Checkout.jsx
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const { cart, clearCart } = useCart();
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Debes iniciar sesión para finalizar la compra.");
        return;
      }

      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items: cart,
        total,
        contact: form,
        status: "pendiente",
        createdAt: serverTimestamp(),
      });

      clearCart();
      alert("✅ Orden creada con éxito. Procesa el pago para finalizar.");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("❌ Error al crear la orden.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return <p className="p-6">Tu carrito está vacío.</p>;
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Finalizar compra</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nombre completo"
          required
          className="border p-2 w-full rounded"
        />
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Dirección de envío"
          required
          className="border p-2 w-full rounded"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Teléfono de contacto"
          required
          className="border p-2 w-full rounded"
        />

        <p className="text-lg font-semibold">Total: ${total}</p>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Confirmar compra"}
        </button>
      </form>
    </div>
  );
}

export default Checkout;
