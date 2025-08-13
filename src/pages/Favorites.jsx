// Favorites.jsx
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import ProductCard from "../components/ProductCard";

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const particlesRef = useRef([]);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        let favIds = [];

        if (user) {
          // 🔹 Obtener favoritos desde Firestore
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            favIds = userSnap.data().favorites || [];
          }
        } else {
          // 🔹 Obtener favoritos desde localStorage
          favIds = JSON.parse(localStorage.getItem("favorites") || "[]");
        }

        setFavorites(favIds);

        if (favIds.length > 0) {
          // 🔹 Firebase solo permite máx 10 elementos en "in"
          const chunks = [];
          for (let i = 0; i < favIds.length; i += 10) {
            chunks.push(favIds.slice(i, i + 10));
          }

          let allProducts = [];
          for (const chunk of chunks) {
            const productsRef = collection(db, "products");
            const q = query(productsRef, where("__name__", "in", chunk));
            const querySnap = await getDocs(q);

            allProducts = [
              ...allProducts,
              ...querySnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })),
            ];
          }

          setProducts(allProducts);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error cargando favoritos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [user]);

  // 🎨 Efecto partículas lentas
  useEffect(() => {
    const particles = particlesRef.current;
    particles.forEach((particle) => resetParticle(particle));

    let animationFrame;
    function animate() {
      particles.forEach((p) => {
        const speed = parseFloat(p.dataset.speed);
        p.style.top = `${parseFloat(p.style.top) - speed}px`;
        p.style.opacity = parseFloat(p.style.opacity) - 0.0005;

        if (parseFloat(p.style.top) < -10 || parseFloat(p.style.opacity) <= 0) {
          resetParticle(p);
        }
      });
      animationFrame = requestAnimationFrame(animate);
    }

    function resetParticle(p) {
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${100 + Math.random() * 20}%`;
      p.style.opacity = 0.1 + Math.random() * 0.3;
      p.style.width = `${2 + Math.random() * 4}px`;
      p.style.height = p.style.width;
      p.dataset.speed = 0.05 + Math.random() * 0.08;
    }

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Cargando favoritos...</div>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fondo gradiente animado */}
      <div className="absolute inset-0 bg-gradient-animate z-0"></div>

      {/* Partículas */}
      <div className="absolute inset-0 z-10">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            ref={(el) => (particlesRef.current[i] = el)}
            className="absolute bg-white rounded-full pointer-events-none"
            style={{ opacity: 0 }}
          ></span>
        ))}
      </div>

      {/* Contenido */}
      <div className="relative z-20 p-6 text-white">
        <div className="max-w-7xl mx-auto text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-outline">
            Mis favoritos ❤️
          </h1>
          <p className="text-lg opacity-90 text-outline">
            Aquí están todos los productos que te encantan
          </p>
        </div>

        {products.length > 0 ? (
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center text-lg mt-6 text-outline">
            No tienes productos en favoritos.
          </div>
        )}
      </div>
    </div>
  );
}
