import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { app } from "../src/firebase";

function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const auth = getAuth(app);
  const user = auth.currentUser;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    try {
      const res = await fetch("/api/createPreference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          total: total,
          userId: user?.uid || "guest",
        }),
      });

      const data = await res.json();

      if (data.init_point) {
        // No vaciar el carrito aún, solo después de confirmación del webhook
        window.location.href = data.init_point;
      } else {
        alert("No se pudo iniciar el pago.");
      }
    } catch (error) {
      console.error("Error iniciando checkout:", error);
      alert("Error al procesar el pago.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tu Carrito</h1>

      {cart.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg mb-4">No tienes productos en el carrito.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Volver a la tienda
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border p-4 rounded-lg bg-white shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image || "/placeholder-product.jpg"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="text-gray-600">
                      {item.quantity} x ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Subtotal:</span>
              <span className="text-lg">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              Finalizar compra
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
