import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function Cart({ cart, removeFromCart }) {
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      // 1. Guardar la orden en Firestore (estado "pending")
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user?.uid || "guest",
        items: cart,
        total,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // 2. Redirigir directamente al checkout de MercadoPago
      const mp = new window.MercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY);

      mp.checkout({
        preference: {
          items: cart.map((item) => ({
            title: item.name,
            unit_price: item.price,
            quantity: item.quantity,
          })),
          external_reference: orderRef.id, // ID de la orden en Firebase
        },
        autoOpen: true, // Abre el checkout directamente
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Carrito</h2>
      {cart.map((item) => (
        <div key={item.id}>
          {item.name} - ${item.price} x {item.quantity}
          <button onClick={() => removeFromCart(item.id)}>Eliminar</button>
        </div>
      ))}
      <p>Total: ${total}</p>
      <button onClick={handleCheckout} disabled={loading || cart.length === 0}>
        {loading ? "Procesando..." : "Pagar con MercadoPago"}
      </button>
    </div>
  );
}
