import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function CarruselIzquierdo() {
  const [carrusel, setCarrusel] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchCarrusel() {
      try {
        // 1. Obtener configuración del carrusel
        const docRef = doc(db, "components", "carruselIzquierdo");
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || !docSnap.data().active) {
          setCarrusel(null);
          setProducts([]);
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        setCarrusel(data);

        if (!data.products || data.products.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // 2. Obtener productos UNO POR UNO (evita problemas con 'in')
        const productPromises = data.products.map((productId) =>
          getDoc(doc(db, "products", productId))
        );

        const productSnaps = await Promise.all(productPromises);

        // Aquí forzamos que active sea true para todos, sin importar el valor en Firestore
        const prods = productSnaps
          .filter((snap) => snap.exists())
          .map((snap) => ({
            id: snap.id,
            active: true,
            ...snap.data(),
          }));

        setProducts(prods);
      } catch (error) {
        console.error("Error cargando carrusel:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCarrusel();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (!carrusel || !carrusel.active) return null;

  return (
    <div
      className="rounded-xl shadow-lg overflow-hidden flex flex-col items-center p-6 relative ml-5 mt-3"
      style={{
        background: `linear-gradient(135deg, ${
          carrusel.colors?.[0] || "#3b82f6"
        }, ${carrusel.colors?.[1] || "#1d4ed8"})`,
      }}
    >
      {/* Descripción */}
      {carrusel.description && (
        <h2 className="text-2xl font-bold mb-6 text-white text-center drop-shadow-md">
          {carrusel.description}
        </h2>
      )}

      {/* Carrusel vertical de productos */}
      <div className="w-full h-[700px] relative">
        <Swiper
          modules={[Autoplay]}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          direction="vertical"
          loop={products.length > 5}
          spaceBetween={20}
          slidesPerView={4}
          className="h-full w-full"
          breakpoints={{
            640: {
              slidesPerView: 3,
            },
            768: {
              slidesPerView: 4,
            },
            1024: {
              slidesPerView: 5,
            },
          }}
        >
          {products.map(
            ({ id, name, image, price, priceBase, desc, active }) => (
              <SwiperSlide key={id} className="!h-[120px]">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-3 flex items-center gap-4 h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  <img
                    src={image || "/placeholder-product.jpg"}
                    alt={name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">
                      {name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {desc > 0 ? (
                        <>
                          <span className="text-lg font-bold text-red-500">
                            ${price?.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ${priceBase?.toFixed(2)}
                          </span>
                          <span className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded-full">
                            -{desc}%
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-blue-600">
                          ${price?.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            )
          )}
        </Swiper>
      </div>

      {/* Botón ver productos */}
      <Link
        to="/carrusel"
        className="mt-6 px-6 py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg shadow-md transition-all duration-300 hover:shadow-lg backdrop-blur-sm border border-white/20"
      >
        Ver todos los productos
      </Link>
    </div>
  );
}
