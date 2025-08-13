import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [product, setProduct] = useState({
    name: "",
    priceBase: 0,
    desc: 0,
    price: 0,
    description: "",
    category: "",
    stock: 0,
    image: "",
    active: true,
    favorites: [],
  });

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Si el producto existente no tiene priceBase, lo establecemos igual al price
          setProduct({
            ...data,
            priceBase: data.priceBase || data.price,
            desc: data.desc || 0,
            favorites: data.favorites || [],
          });
        }
        setLoading(false);
      };

      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProduct((prev) => {
      const updatedProduct = {
        ...prev,
        [name]:
          name === "priceBase" || name === "stock" || name === "desc"
            ? parseFloat(value) || 0
            : value,
      };

      // Calcular el precio final cuando cambia priceBase o desc
      if (name === "priceBase" || name === "desc") {
        const priceBase = parseFloat(updatedProduct.priceBase) || 0;
        const desc = parseFloat(updatedProduct.desc) || 0;
        updatedProduct.price = priceBase - (priceBase * desc) / 100;
      }

      return updatedProduct;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...product,
        updatedAt: new Date(),
      };

      // Asegurarnos que el precio calculado está actualizado
      productData.price =
        product.priceBase - (product.priceBase * product.desc) / 100;

      if (id) {
        // Editar producto existente
        await setDoc(doc(db, "products", id), productData, { merge: true });
      } else {
        // Crear nuevo producto
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date(),
        });
      }

      navigate("/admin/products");
    } catch (error) {
      console.error("Error saving product: ", error);
      alert("Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {id ? "Editar Producto" : "Nuevo Producto"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre del producto
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={product.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="priceBase"
                className="block text-sm font-medium text-gray-700"
              >
                Precio Base
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="priceBase"
                  id="priceBase"
                  value={product.priceBase}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="desc"
                className="block text-sm font-medium text-gray-700"
              >
                Descuento (%)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="desc"
                  id="desc"
                  value={product.desc}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="1"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Precio Final
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={product.price.toFixed(2)}
                  readOnly
                  className="bg-gray-100 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Calculado: ${product.priceBase} - {product.desc}% = $
                {product.price.toFixed(2)}
              </p>
            </div>

            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700"
              >
                Stock disponible
              </label>
              <input
                type="number"
                name="stock"
                id="stock"
                value={product.stock}
                onChange={handleChange}
                min="0"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Categoría
              </label>
              <input
                type="text"
                name="category"
                id="category"
                value={product.category}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                URL de la imagen
              </label>
              <input
                type="url"
                name="image"
                id="image"
                value={product.image}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {product.image && (
                <div className="mt-2">
                  <img
                    src={product.image}
                    alt="Preview"
                    className="h-32 object-contain"
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Descripción
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={product.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
