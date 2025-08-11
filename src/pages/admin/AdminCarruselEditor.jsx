import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSave,
  FiArrowLeft,
  FiTrash2,
  FiPlus,
  FiEdit,
  FiSearch,
  FiPercent,
  FiRotateCcw,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function AdminCarruselEditor() {
  const navigate = useNavigate();
  const [carrusel, setCarrusel] = useState({
    name: "",
    description: "",
    colors: ["#3b82f6", "#1d4ed8"],
    products: [],
    discount: 0,
  });
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [originalPrices, setOriginalPrices] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos del carrusel
        const docRef = doc(db, "components", "carruselIzquierdo");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCarrusel({
            name: data.name || "",
            description: data.description || "",
            colors: data.colors || ["#3b82f6", "#1d4ed8"],
            products: data.products || [],
            discount: data.discount || 0,
          });
          setOriginalData(data);
        }

        // Obtener productos y precios originales
        const productsSnapshot = await getDocs(collection(db, "products"));
        const prods = [];
        const prices = {};

        productsSnapshot.forEach((doc) => {
          const productData = doc.data();
          prods.push({
            id: doc.id,
            ...productData,
          });
          prices[doc.id] = {
            originalPrice: productData.originalPrice || productData.price,
            originalPriceColor: productData.priceColor || "inherit",
          };
        });

        setProducts(prods);
        setOriginalPrices(prices);
      } catch (err) {
        toast.error("Error al cargar los datos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar productos
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      return;
    }
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Manejar cambios locales
  const handleChange = (field, value) => {
    setCarrusel((prev) => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (index, color) => {
    const newColors = [...carrusel.colors];
    newColors[index] = color;
    handleChange("colors", newColors);
  };

  const addProduct = async (productId) => {
    if (!productId || carrusel.products.includes(productId)) return;

    // Aplicar descuento al producto cuando se agrega
    if (carrusel.discount > 0) {
      await applyDiscountToProduct(productId, carrusel.discount);
    }

    handleChange("products", [...carrusel.products, productId]);
    setSearchTerm("");
    setShowDropdown(false);
    toast.success("Producto agregado (pendiente de guardar)");
  };

  const removeProduct = async (productId) => {
    // Restaurar precio original cuando se quita del carrusel
    await restoreOriginalPrice(productId);

    handleChange(
      "products",
      carrusel.products.filter((id) => id !== productId)
    );
    toast.success("Producto removido (pendiente de guardar)");
  };

  // Aplicar descuento a un producto
  const applyDiscountToProduct = async (productId, discount) => {
    const productRef = doc(db, "products", productId);
    const product = products.find((p) => p.id === productId);
    const originalPrice = originalPrices[productId]?.originalPrice;

    if (!product || originalPrice === undefined) return;

    const discountedPrice = originalPrice * (1 - discount / 100);

    try {
      await updateDoc(productRef, {
        price: discountedPrice,
        priceColor: "#ef4444",
        originalPrice: originalPrice,
        hasDiscount: true,
      });
    } catch (err) {
      toast.error(`Error al aplicar descuento al producto ${product.name}`);
      console.error(err);
    }
  };

  // Restaurar precio original
  const restoreOriginalPrice = async (productId) => {
    const productRef = doc(db, "products", productId);
    const originalPrice = originalPrices[productId]?.originalPrice;

    if (originalPrice === undefined) return;

    try {
      await updateDoc(productRef, {
        price: originalPrice,
        priceColor: originalPrices[productId]?.originalPriceColor || "inherit",
        hasDiscount: false,
        originalPrice: originalPrice,
      });
    } catch (err) {
      toast.error("Error al restaurar precio original");
      console.error(err);
    }
  };

  // Aplicar/reemplazar descuento a todos los productos del carrusel
  const applyDiscountToAll = async () => {
    if (carrusel.discount < 0 || carrusel.discount > 100) {
      toast.error("El descuento debe estar entre 0 y 100");
      return;
    }

    const batch = writeBatch(db);

    try {
      for (const productId of carrusel.products) {
        const productRef = doc(db, "products", productId);
        const originalPrice = originalPrices[productId]?.originalPrice;

        if (originalPrice !== undefined) {
          if (carrusel.discount > 0) {
            // Aplicar nuevo descuento sobre el precio ORIGINAL
            const discountedPrice =
              originalPrice * (1 - carrusel.discount / 100);
            batch.update(productRef, {
              price: discountedPrice,
              priceColor: "#ef4444",
              originalPrice: originalPrice,
              hasDiscount: true,
            });
          } else {
            // Restaurar precio original si el descuento es 0%
            batch.update(productRef, {
              price: originalPrice,
              priceColor:
                originalPrices[productId]?.originalPriceColor || "inherit",
              hasDiscount: false,
              originalPrice: originalPrice,
            });
          }
        }
      }

      await batch.commit();
      toast.success(
        carrusel.discount > 0
          ? `Descuento del ${carrusel.discount}% aplicado correctamente`
          : "Descuento removido correctamente"
      );
    } catch (err) {
      toast.error("Error al aplicar descuentos");
      console.error(err);
    }
  };

  // Restablecer completamente los descuentos
  const resetDiscounts = async () => {
    const batch = writeBatch(db);

    try {
      // Actualizar el carrusel para establecer descuento a 0
      const carruselRef = doc(db, "components", "carruselIzquierdo");
      batch.update(carruselRef, {
        discount: 0,
      });

      // Restaurar precios originales de todos los productos
      for (const productId of carrusel.products) {
        const productRef = doc(db, "products", productId);
        const originalPrice = originalPrices[productId]?.originalPrice;

        if (originalPrice !== undefined) {
          batch.update(productRef, {
            price: originalPrice,
            priceColor:
              originalPrices[productId]?.originalPriceColor || "inherit",
            hasDiscount: false,
            originalPrice: originalPrice,
          });
        }
      }

      await batch.commit();
      setCarrusel((prev) => ({ ...prev, discount: 0 }));
      toast.success("Todos los descuentos han sido restablecidos");
    } catch (err) {
      toast.error("Error al restablecer descuentos");
      console.error(err);
    }
  };

  // Guardar cambios en Firebase
  const saveChanges = async () => {
    try {
      const batch = writeBatch(db);

      // Actualizar datos del carrusel
      const carruselRef = doc(db, "components", "carruselIzquierdo");
      batch.update(carruselRef, {
        name: carrusel.name,
        description: carrusel.description,
        colors: carrusel.colors,
        products: carrusel.products,
        discount: carrusel.discount,
      });

      // Actualizar productos
      for (const productId of carrusel.products) {
        const productRef = doc(db, "products", productId);
        const originalPrice = originalPrices[productId]?.originalPrice;

        if (originalPrice !== undefined) {
          if (carrusel.discount > 0) {
            const discountedPrice =
              originalPrice * (1 - carrusel.discount / 100);
            batch.update(productRef, {
              price: discountedPrice,
              priceColor: "#ef4444",
              originalPrice: originalPrice,
              hasDiscount: true,
            });
          } else {
            batch.update(productRef, {
              price: originalPrice,
              priceColor:
                originalPrices[productId]?.originalPriceColor || "inherit",
              hasDiscount: false,
              originalPrice: originalPrice,
            });
          }
        }
      }

      await batch.commit();
      setOriginalData(carrusel);
      toast.success("Cambios guardados exitosamente!");
    } catch (err) {
      toast.error("Error al guardar los cambios");
      console.error(err);
    }
  };

  // Revertir cambios
  const revertChanges = async () => {
    if (originalData) {
      // Restaurar precios de los productos que ya no están en el carrusel
      const productsToRestore = carrusel.products.filter(
        (id) => !originalData.products.includes(id)
      );

      for (const productId of productsToRestore) {
        await restoreOriginalPrice(productId);
      }

      // Aplicar descuento original a los productos que permanecen
      if (originalData.discount > 0) {
        for (const productId of originalData.products) {
          await applyDiscountToProduct(productId, originalData.discount);
        }
      }

      setCarrusel(originalData);
      toast.success("Cambios revertidos");
    }
  };

  // Verificar si hay cambios
  const hasChanges = JSON.stringify(carrusel) !== JSON.stringify(originalData);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 py-8 px-4"
    >
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
            >
              <FiArrowLeft /> Volver
            </button>
            <h1 className="text-2xl font-bold">Editor de Carrusel</h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-6 space-y-8">
          {/* Sección de información básica */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={carrusel.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Nombre del carrusel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={carrusel.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Descripción del carrusel"
              />
            </div>
          </div>

          {/* Selector de colores y descuento */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Colores del Carrusel
              </h3>
              <div className="flex gap-4">
                {carrusel.colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="w-12 h-12 cursor-pointer rounded-lg border"
                    />
                    <span className="text-sm text-gray-600">
                      Color {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Descuento</h3>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={carrusel.discount}
                    onChange={(e) =>
                      handleChange("discount", parseInt(e.target.value) || 0)
                    }
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Porcentaje de descuento"
                  />
                  <FiPercent className="absolute left-3 top-2.5 text-gray-400" />
                </div>
                <button
                  onClick={applyDiscountToAll}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white transition"
                >
                  <FiSave size={16} /> Aplicar
                </button>
                <button
                  onClick={resetDiscounts}
                  className="p-2 rounded-lg flex items-center gap-2 bg-gray-200 hover:bg-gray-300 transition"
                  title="Restablecer descuentos"
                >
                  <FiRotateCcw size={16} />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                El descuento se aplicará sobre el precio original. Precios con
                descuento se mostrarán en rojo.
              </p>
            </div>
          </div>

          {/* Buscador de productos */}
          <div className="relative">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Agregar Productos
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Buscar productos..."
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition pr-10"
              />
              <FiSearch className="absolute right-3 top-3.5 text-gray-400" />
            </div>

            <AnimatePresence>
              {showDropdown && filteredProducts.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
                >
                  {filteredProducts.map((product) => (
                    <motion.li
                      key={product.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3"
                      onMouseDown={() => addProduct(product.id)}
                    >
                      <img
                        src={product.image || "/placeholder-product.jpg"}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm ${
                              product.hasDiscount
                                ? "text-red-500 line-through"
                                : "text-gray-500"
                            }`}
                          >
                            ${product.price?.toFixed(2)}
                          </p>
                          {product.hasDiscount && product.originalPrice && (
                            <p className="text-sm text-gray-500">
                              ${product.originalPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Lista de productos seleccionados */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Productos en el Carrusel
              </h3>
              <span className="text-sm text-gray-500">
                {carrusel.products.length}{" "}
                {carrusel.products.length === 1 ? "producto" : "productos"}
              </span>
            </div>

            {carrusel.products.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No hay productos en el carrusel</p>
              </div>
            ) : (
              <motion.ul className="space-y-3">
                <AnimatePresence>
                  {carrusel.products.map((productId) => {
                    const product = products.find((p) => p.id === productId);
                    if (!product) return null;

                    return (
                      <motion.li
                        key={productId}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <img
                            src={product.image || "/placeholder-product.jpg"}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-sm ${
                                  product.hasDiscount
                                    ? "text-red-500 line-through"
                                    : "text-gray-600"
                                }`}
                              >
                                ${product.price?.toFixed(2)}
                              </p>
                              {product.hasDiscount && product.originalPrice && (
                                <p className="text-sm text-gray-500">
                                  ${product.originalPrice.toFixed(2)}
                                </p>
                              )}
                              {product.hasDiscount && (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                                  -{carrusel.discount}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeProduct(productId)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                        >
                          <FiTrash2 />
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </motion.ul>
            )}
          </div>
        </div>

        {/* Barra de acciones */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between">
          <button
            onClick={revertChanges}
            disabled={!hasChanges}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              hasChanges
                ? "bg-gray-200 hover:bg-gray-300"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            } transition`}
          >
            <FiArrowLeft /> Revertir
          </button>
          <button
            onClick={saveChanges}
            disabled={!hasChanges}
            className={`px-6 py-2 rounded-lg flex items-center gap-2 text-white ${
              hasChanges
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-400 cursor-not-allowed"
            } transition`}
          >
            <FiSave /> Guardar Cambios
          </button>
        </div>
      </div>
    </motion.div>
  );
}
