import { useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

function Cart() {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    isCartLoaded,
  } = useCart();

  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const hasLoaded = useRef(false);

  // Cargar carrito una sola vez
  useEffect(() => {
    if (hasLoaded.current || !isCartLoaded) return;
    hasLoaded.current = true;

    const loadCart = async () => {
      if (user) {
        try {
          const docRef = doc(db, "carts", user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            // El contexto ya maneja la actualización
          }
        } catch (error) {
          console.error("Error loading cart:", error);
        }
      }
    };

    loadCart();
  }, [user, isCartLoaded]);

  // Checkout
  const handleCheckout = async () => {
    if (!user) {
      sessionStorage.setItem("pendingCheckout", JSON.stringify(cartItems));
      navigate("/login");
      return;
    }

    try {
      const userId = user.uid;
      const res = await fetch("/api/createPreference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems, userId }),
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

  if (!isCartLoaded) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Tu Carrito</h1>
        <Link
          to="/"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Volver a la tienda
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl shadow">
          <p className="text-lg text-gray-600">Tu carrito está vacío 😢</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Seguir comprando
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-6">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between bg-white shadow-md rounded-xl p-4 border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      item.imageUrl ||
                      item.image ||
                      "https://via.placeholder.com/80"
                    }
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg border"
                    loading="lazy"
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
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
              Total: ${cartTotal.toFixed(2)}
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
