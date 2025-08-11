import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolid,
  ShoppingCartIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(0);

  // Actualizar cantidad cuando cambie el carrito
  useEffect(() => {
    const cartItem = cartItems.find((item) => item.id === product.id);
    setCurrentQuantity(cartItem?.quantity || 0);
  }, [cartItems, product.id]);

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAdding(true);
    try {
      await addToCart(product);

      // Notificación estilo toast
      await Swal.fire({
        position: "top-end",
        icon: "success",
        title: "¡Agregado al carrito!",
        text: `${product.name}`,
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        toast: true,
        background: "#10B981",
        color: "white",
        iconColor: "#FFFFFF",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo agregar al carrito",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: isFavorite ? "Removido de favoritos" : "❤️ ¡Agregado a favoritos!",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      toast: true,
      background: isFavorite ? "#6B7280" : "#EC4899",
      iconColor: isFavorite ? "#9CA3AF" : "#F472B6",
    });
  };

  if (!product) return null;

  // Verificar si hay descuento
  const hasDiscount = product.desc > 0;

  return (
    <div className="relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col border border-gray-100">
      {/* Header de la card */}
      <div className="relative flex-1">
        {/* Botón favoritos */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-pink-100 transition-colors shadow-sm"
          aria-label={
            isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"
          }
        >
          {isFavorite ? (
            <HeartSolid className="h-6 w-6 text-pink-500 animate-[pulse_0.5s_ease-in-out]" />
          ) : (
            <HeartOutline className="h-6 w-6 text-gray-400 hover:text-pink-500 transition-colors" />
          )}
        </button>

        {/* Badge destacado */}
        {product.featured && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full z-10 shadow-sm">
            Destacado
          </div>
        )}

        {/* Badge de descuento */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-sm">
            -{product.desc}%
          </div>
        )}

        {/* Imagen con efecto hover */}
        <div
          className="relative h-64 overflow-hidden group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={
              product.imageUrl || product.image || "/placeholder-product.jpg"
            }
            alt={product.name || "Producto"}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
            loading="lazy"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent ${
              isHovered ? "opacity-100" : "opacity-0"
            } transition-opacity duration-500`}
          />
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {product.name || "Producto"}
            </h2>
            <p className="text-sm text-gray-500">
              {product.category || "Categoría general"}
            </p>
          </div>
          <div className="flex flex-col items-end">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-red-500 whitespace-nowrap">
                  ${product.price?.toFixed(2) || "0.00"}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ${product.priceBase?.toFixed(2) || "0.00"}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-blue-600 whitespace-nowrap">
                ${product.price?.toFixed(2) || "0.00"}
              </span>
            )}
          </div>
        </div>

        {/* Variantes de color */}
        {product.variants?.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Colores:</p>
            <div className="flex flex-wrap gap-1">
              {product.variants.map((color, index) => (
                <span
                  key={index}
                  className="inline-block w-4 h-4 rounded-full border border-gray-200 shadow-xs"
                  style={{ backgroundColor: color }}
                  title={`Color: ${color}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center gap-2 mt-4">
          {/* Botón carrito con contador */}
          <Link
            to="/cart"
            className="relative flex-shrink-0 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center group"
            aria-label="Ver carrito"
          >
            <ShoppingCartIcon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            {currentQuantity > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-[bounce_0.5s_ease-in-out] transform hover:scale-110 transition-transform">
                {currentQuantity}
              </span>
            )}
          </Link>

          {/* Botón principal */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
              isAdding
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white active:scale-[0.98] shadow-md hover:shadow-lg"
            } flex items-center justify-center gap-2`}
          >
            {isAdding ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Añadiendo...
              </>
            ) : (
              <>
                <span>Agregar</span>
                <span className="hidden sm:inline">al carrito</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
