import { useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";

function Cart() {
  const { cart, setCart, addToCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const hasLoaded = useRef(false); // ✅ evita recargas múltiples

  // Calcular total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Cargar carrito (solo una vez por sesión)
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const loadCart = async () => {
      if (user) {
        const docRef = doc(db, "carts", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setCart(snap.data().items);
        } else {
          const localCart = JSON.parse(localStorage.getItem("cart")) || [];
          setCart(localCart);
        }
      } else {
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(localCart);
      }
    };
    loadCart();
  }, [user, setCart]);

  // Checkout
  const handleCheckout = async () => {
    if (!user) {
      sessionStorage.setItem("pendingCheckout", JSON.stringify(cart));
      navigate("/login");
      return;
    }

    try {
      const userId = user.uid;
      const res = await fetch("/api/createPreference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, userId }),
      });

      const data = await res.json();
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
                className="flex items-center justify-between bg-white shadow-md rounded-xl p-4 border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.imageUrl || "https://via.placeholder.com/80"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {item.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      ${item.price} x {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      addToCart({ ...item, quantity: item.quantity - 1 })
                    }
                    disabled={item.quantity <= 1}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="font-medium">{item.quantity}</span>
                  <button
                    onClick={() =>
                      addToCart({ ...item, quantity: item.quantity + 1 })
                    }
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-4 text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 p-6 bg-gray-50 rounded-xl shadow">
            <p className="text-xl font-bold text-gray-800">
              Total: ${total.toFixed(2)}
            </p>
            <button
              onClick={handleCheckout}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl shadow-lg transition"
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
