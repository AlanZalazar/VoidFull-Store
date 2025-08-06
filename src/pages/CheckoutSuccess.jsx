// src/pages/CheckoutSuccess.jsx
import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function CheckoutSuccess() {
  const { clearCart } = useCart();
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hasCleared = useRef(false); // ✅ evita loop

  useEffect(() => {
    const runClear = async () => {
      if (hasCleared.current) return; // solo una vez
      hasCleared.current = true;

      try {
        await clearCart();
        sessionStorage.removeItem("pendingCheckout");
      } catch (error) {
        console.error("❌ Error limpiando el carrito:", error);
      } finally {
        setLoading(false);
      }
    };

    runClear();
  }, [clearCart, user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-600">Procesando tu pedido...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-b from-green-50 to-white p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-lg w-full text-center border border-green-100">
        <div className="flex justify-center">
          <div className="bg-green-100 text-green-600 rounded-full p-4 mb-4">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ¡Pago realizado con éxito! 🎉
        </h1>
        <p className="text-gray-600 mb-6">
          Gracias por tu compra. Tu pedido ya está siendo procesado.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition"
          >
            Volver al inicio
          </button>
          <button
            onClick={() => navigate("/mis-compras")}
            className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold shadow-md transition"
          >
            Ver mis compras
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSuccess;
