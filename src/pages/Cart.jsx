import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";

// Componente de notificación (puede moverse a un archivo aparte)
function Notification({ message, type = "info", onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    error: "bg-red-100 border-red-400 text-red-700",
    success: "bg-green-100 border-green-400 text-green-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
  };

  return (
    <div
      className={`${typeStyles[type]} border px-4 py-3 rounded fixed top-4 right-4 z-50 max-w-md shadow-lg transition-opacity duration-300`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex justify-between items-center">
        <span className="block sm:inline">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="ml-4 text-lg font-semibold focus:outline-none"
          aria-label="Cerrar notificación"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, isCartLoaded } =
    useCart();

  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const hasLoaded = useRef(false);
  const [notification, setNotification] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
          setNotification({
            message: "Error al cargar tu carrito. Por favor recarga la página.",
            type: "error",
          });
        }
      }
    };

    loadCart();
  }, [user, isCartLoaded]);

  // Checkout mejorado con estados de carga
  const handleCheckout = async () => {
    setIsProcessing(true);

    if (!user) {
      sessionStorage.setItem("pendingCheckout", JSON.stringify(cartItems));
      navigate("/login");
      setIsProcessing(false);
      return;
    }

    try {
      const userId = user.uid;
      const res = await fetch("/api/createPreference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems, userId }),
      });

      if (!res.ok) throw new Error("Error en la respuesta del servidor");

      const data = await res.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        setNotification({
          message: "No se pudo iniciar el pago. Por favor intente nuevamente.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error en checkout:", error);
      setNotification({
        message: "Error al procesar el pago. Por favor verifica tu conexión.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Manejar cambio de cantidad con validación
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > 99) {
      setNotification({
        message: "La cantidad máxima por producto es 99",
        type: "warning",
      });
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  if (!isCartLoaded) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
            aria-label="Cargando carrito"
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
      {/* Notificación */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Encabezado */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Tu Carrito</h1>
        <Link
          to="/"
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          aria-label="Volver a la tienda"
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

      {/* Contenido del carrito */}
      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl shadow">
          <p className="text-lg text-gray-600">Tu carrito está vacío 😢</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Seguir comprando"
          >
            Seguir comprando
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {cartItems.map((item) => (
              <li
                key={`${item.id}-${item.size || "no-size"}`}
                className="flex flex-col md:flex-row items-center justify-between bg-white shadow-md rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                  <img
                    src={
                      item.imageUrl ||
                      item.image ||
                      "https://via.placeholder.com/80"
                    }
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg border"
                    loading="lazy"
                    width="80"
                    height="80"
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-800 truncate">
                      {item.name}
                    </h2>
                    {item.size && (
                      <p className="text-sm text-gray-500">
                        Talla: {item.size}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors focus:outline-none"
                      aria-label="Reducir cantidad"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-medium min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-4 text-red-600 hover:text-red-800 transition-colors focus:outline-none"
                    aria-label="Eliminar producto"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Resumen y checkout */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl shadow sticky bottom-0">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-semibold text-gray-800">Subtotal:</p>
              <p className="text-lg font-bold">${cartTotal.toFixed(2)}</p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isProcessing || cartItems.length === 0}
              className={`mt-4 w-full ${
                isProcessing
                  ? "bg-green-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white font-semibold py-3 rounded-xl shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
              aria-label="Finalizar compra"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                "Finalizar compra"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
