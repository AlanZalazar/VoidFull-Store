import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // 👈 importa Firebase auth

function Cart() {
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/createPreference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, userId: "usuarioID" }),
      });

      const data = await res.json();
      console.log("Respuesta del backend:", data);

      if (data.init_point) {
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tu Carrito</h1>
      {cart.length === 0 ? (
        <p>No tienes productos en el carrito.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border p-4 rounded"
              >
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p>
                    {item.quantity} x ${item.price}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <p className="text-lg font-bold">Total: ${total}</p>
            <button
              onClick={handleCheckout}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
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
