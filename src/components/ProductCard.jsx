import { useCart } from "../context/CartContext";
import { useState } from "react";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      className="relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge de destacado (opcional) */}
      {product.featured && (
        <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full z-10">
          Destacado
        </div>
      )}

      {/* Imagen del producto */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={product.imageUrl || product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? "scale-105" : "scale-100"
          }`}
        />
        {/* Efecto hover */}
        <div
          className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        ></div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {product.name}
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              {product.category || "Taza de cerámica"}
            </p>
          </div>
          <span className="text-lg font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </span>
        </div>

        {/* Variantes (opcional) */}
        {product.variants && (
          <div className="my-2">
            <p className="text-xs text-gray-500 mb-1">Colores disponibles:</p>
            <div className="flex space-x-2">
              {product.variants.map((color, index) => (
                <span
                  key={index}
                  className="w-4 h-4 rounded-full inline-block"
                  style={{ backgroundColor: color }}
                  title={color}
                ></span>
              ))}
            </div>
          </div>
        )}

        {/* Botón de añadir al carrito */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-colors duration-300 ${
            isAdding
              ? "bg-gray-300 text-gray-600"
              : "bg-blue-600 hover:bg-blue-700 text-white active:scale-105"
          } flex items-center justify-center`}
        >
          {isAdding ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              Añadiendo...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Añadir al carrito
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
