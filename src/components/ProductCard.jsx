import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartSolid,
  ShoppingCartIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { createPortal } from "react-dom";

function ProductCard({ product, onDelete }) {
  const { addToCart, cartItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(0);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const cartItem = cartItems.find((item) => item.id === product.id);
    setCurrentQuantity(cartItem?.quantity || 0);
  }, [cartItems, product.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    try {
      await addToCart(product);
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

  const handleEdit = () => {
    navigate(`/admin/products/edit/${product.id}`);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar producto?",
      text: `¿Estás seguro de eliminar "${product.name}"? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "products", product.id));
        Swal.fire("¡Eliminado!", "El producto ha sido eliminado.", "success");

        // 🔹 Actualizar el estado en el padre
        if (onDelete) onDelete(product.id);
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        Swal.fire(
          "Error",
          "No se pudo eliminar el producto. Inténtalo de nuevo.",
          "error"
        );
      }
    }
  };

  const openDetailsModal = (e) => {
    e.stopPropagation();
    setShowDetailsModal(true);
  };

  const closeDetailsModal = (e) => {
    if (e) e.stopPropagation();
    setShowDetailsModal(false);
  };

  if (!product) return null;
  const hasDiscount = product.desc > 0;

  return (
    <>
      {/* Card */}
      <div className="min-w-[280px] relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col border border-gray-100">
        {/* Imagen y botones */}
        <div className="relative flex-1">
          {/* Botón favoritos */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite();
            }}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-pink-100 transition-colors shadow-sm"
          >
            {isFavorite ? (
              <HeartSolid className="h-6 w-6 text-pink-500 animate-[pulse_0.5s_ease-in-out]" />
            ) : (
              <HeartOutline className="h-6 w-6 text-gray-400 hover:text-pink-500 transition-colors" />
            )}
          </button>

          {/* Badge descuento */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-sm">
              -{product.desc}%
            </div>
          )}

          {/* Imagen */}
          <div
            className="relative h-64 w-full overflow-hidden group cursor-pointer"
            onClick={openDetailsModal}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="h-full w-full flex items-center justify-center p-4">
              <img
                src={
                  product.imageUrl ||
                  product.image ||
                  "/placeholder-product.jpg"
                }
                alt={product.name || "Producto"}
                className={`max-h-full max-w-full object-contain transition-transform duration-700 ${
                  isHovered ? "scale-110" : "scale-100"
                }`}
                loading="lazy"
              />
            </div>
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
                  <span className="text-lg font-bold text-red-500">
                    ${product.price?.toFixed(2) || "0.00"}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ${product.priceBase?.toFixed(2) || "0.00"}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-blue-600">
                  ${product.price?.toFixed(2) || "0.00"}
                </span>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-2 mt-4">
            {isAdmin ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className="flex-1 py-2 px-4 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center gap-2"
                >
                  <PencilSquareIcon className="h-5 w-5" /> Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="flex-1 py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2"
                >
                  <TrashIcon className="h-5 w-5" /> Eliminar
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/cart"
                  onClick={(e) => e.stopPropagation()}
                  className="relative p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  <ShoppingCartIcon className="h-5 w-5 text-gray-600" />
                  {currentQuantity > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {currentQuantity}
                    </span>
                  )}
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                  disabled={isAdding}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                    isAdding
                      ? "bg-gray-300 text-gray-600"
                      : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                  }`}
                >
                  {isAdding ? "Añadiendo..." : "Agregar al carrito"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal con Portal */}
      {showDetailsModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeDetailsModal}
          >
            <div
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {product.name}
                  </h2>
                  <button
                    onClick={closeDetailsModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                    <img
                      src={
                        product.imageUrl ||
                        product.image ||
                        "/placeholder-product.jpg"
                      }
                      alt={product.name}
                      className="max-h-80 object-contain"
                    />
                  </div>
                  <div>
                    <p className="mb-4">
                      {product.description || "No hay descripción."}
                    </p>
                    {!isAdmin && (
                      <button
                        onClick={() => {
                          handleAddToCart();
                          closeDetailsModal();
                        }}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md"
                      >
                        Agregar al carrito
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default ProductCard;
