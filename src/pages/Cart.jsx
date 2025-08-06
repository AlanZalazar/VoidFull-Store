import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

function Cart() {
  const { cart, addToCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      sessionStorage.setItem("pendingCheckout", JSON.stringify(cart));
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("/api/createPreference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, userId: user.uid }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (err) {
      console.error("Error en checkout:", err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Tu Carrito</h1>
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl shadow">
          <p className="text-lg text-gray-600">Tu carrito está vacío 😢</p>
        </div>
      ) : (
        <>
          <ul className="space-y-6">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex justify-between bg-white shadow p-4 rounded"
              >
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p>
                    ${item.price} x {item.quantity}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => addToCart({ ...item })}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => addToCart({ ...item })}>+</button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <p className="text-xl font-bold">Total: ${total}</p>
            <button
              onClick={handleCheckout}
              className="mt-4 bg-green-600 text-white px-6 py-3 rounded"
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
