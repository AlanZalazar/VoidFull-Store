import { useEffect } from "react";
import { useCart } from "../context/CartContext";

export default function CheckoutSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-green-600">¡Pago exitoso!</h1>
      <p>Gracias por tu compra 🎉</p>
    </div>
  );
}
