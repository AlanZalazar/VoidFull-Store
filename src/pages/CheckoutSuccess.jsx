import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useCart } from "../context/CartContext";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const saveOrder = async () => {
      try {
        const paymentId = params.get("payment_id");
        await addDoc(collection(db, "orders"), {
          userId: auth.currentUser?.uid || "guest",
          items: cart,
          total: cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
          paymentId,
          status: "approved",
          createdAt: serverTimestamp(),
        });

        clearCart();
      } catch (error) {
        console.error("Error guardando la orden:", error);
      }
    };

    saveOrder();
  }, []);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-4">¡Pago exitoso!</h1>
      <p>Tu compra ha sido registrada correctamente.</p>
      <button
        onClick={() => navigate("/")}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Volver al inicio
      </button>
    </div>
  );
}
