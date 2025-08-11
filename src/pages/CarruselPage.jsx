// CarruselPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import ProductCard from "../components/ProductCard";

export default function CarruselPage() {
  const { id } = useParams(); // por si luego quieres manejar varios carruseles
  const [carrusel, setCarrusel] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const docRef = doc(db, "components", "carruselIzquierdo");
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        setCarrusel(data);

        if (!data.products || data.products.length === 0) {
          setLoading(false);
          return;
        }

        const productsRef = collection(db, "products");
        const q = query(productsRef, where("__name__", "in", data.products));
        const querySnap = await getDocs(q);

        setProducts(
          querySnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (error) {
        console.error("Error cargando datos del carrusel:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading)
    return <div className="p-6 text-center">Cargando productos...</div>;
  if (!carrusel)
    return <div className="p-6 text-center">Carrusel no encontrado</div>;

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: `linear-gradient(135deg, ${carrusel.colors?.[0]}, ${carrusel.colors?.[1]})`,
      }}
    >
      {/* Encabezado */}
      <div className="max-w-7xl mx-auto text-center text-white mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {carrusel.description || "Ofertas especiales"}
        </h1>
        <p className="text-lg opacity-90">
          Aprovecha estas ofertas únicas por tiempo limitado
        </p>
      </div>

      {/* Lista de productos */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center text-white text-lg mt-6">
          No hay productos en este carrusel.
        </div>
      )}
    </div>
  );
}
