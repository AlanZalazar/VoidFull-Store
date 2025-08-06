// src/pages/CheckoutSuccess.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { auth } from "../firebase";
import { createOrder } from "../services/orders";

function CheckoutSuccess() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const guardarOrden = async () => {
      const user = auth.currentUser;

      if (!user) {
        console.warn("Usuario no logueado, no se puede guardar la orden.");
        return navigate("/");
      }

      const queryParams = new URLSearchParams(location.search);
      const paymentId = queryParams.get("payment_id"); // MP devuelve este param

      try {
        await createOrder(
          user.uid,
          cart,
          cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
          paymentId
        );
        clearCart();
      } catch (error) {
        console.error("Error guardando orden:", error);
      }
    };

    guardarOrden();
  }, [cart, clearCart, location, navigate]);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-4">¡Pago exitoso!</h1>
      <p>Tu orden ha sido registrada. ¡Gracias por tu compra!</p>
      <button
        onClick={() => navigate("/")}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Volver al inicio
      </button>
    </div>
  );
}

export default CheckoutSuccess;
