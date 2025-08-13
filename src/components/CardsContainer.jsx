import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import {
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiPlus,
} from "react-icons/fi";
import { useInView } from "react-intersection-observer";
import { useWindowSize } from "../Hooks/useWindowSize";

const CardsContainer = ({ products }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.05,
    triggerOnce: false,
    rootMargin: "0px 0px 50px 0px",
  });
  const { width } = useWindowSize();
  const [direction, setDirection] = useState(1);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");

  const isMobile = width < 640;
  const [visibleProducts, setVisibleProducts] = useState(
    isMobile ? 5 : products.length
  );

  // Animación de aparición mejorada
  useEffect(() => {
    if (inView) {
      controls.start("visible");
      setHasAnimated(true);
    }
  }, [controls, inView]);

  // Resetear animación al cambiar filtros o tamaño
  useEffect(() => {
    if (width) {
      controls.set("hidden");
      const timer = setTimeout(() => {
        if (inView) controls.start("visible");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [controls, width, searchTerm, selectedCategory, sortOrder]);

  // Obtener categorías únicas
  const categories = ["all", ...new Set(products.map((p) => p.category))];

  // Filtrar, buscar y ordenar
  const filteredProducts = products
    .filter((p) =>
      selectedCategory === "all" ? true : p.category === selectedCategory
    )
    .filter((p) =>
      p.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "asc") return a.price - b.price;
      if (sortOrder === "desc") return b.price - a.price;
      return 0;
    });

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 15,
        duration: 0.5,
      },
    },
    hover: {
      y: -5,
      scale: 1.02,
      boxShadow: "0px 8px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.2 },
    },
  };

  // Animación para el cambio de página (desktop)
  const pageVariants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      position: "absolute",
    }),
    center: {
      x: 0,
      opacity: 1,
      position: "relative",
    },
    exit: (direction) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      position: "absolute",
    }),
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.4,
  };

  // Determinar layout basado en tamaño de ventana
  useEffect(() => {
    if (isMobile) {
      setVisibleProducts(5);
    } else {
      setVisibleProducts(filteredProducts.length);
    }
  }, [
    isMobile,
    filteredProducts.length,
    searchTerm,
    selectedCategory,
    sortOrder,
  ]);

  // Función para cargar más productos en móvil
  const loadMoreProducts = () => {
    setVisibleProducts((prev) => Math.min(prev + 5, filteredProducts.length));
  };

  // Paginación para desktop
  const [currentPage, setCurrentPage] = useState(0);
  const getProductsPerPage = () => {
    if (width < 640) return 1;
    if (width < 768) return 2;
    if (width < 1024) return 6;
    return 8;
  };

  const productsPerPage = getProductsPerPage();
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleNext = () => {
    setDirection(1);
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Productos a mostrar
  const productsToShow = isMobile
    ? filteredProducts.slice(0, visibleProducts)
    : filteredProducts.slice(
        currentPage * productsPerPage,
        (currentPage + 1) * productsPerPage
      );

  return (
    <section
      ref={ref}
      className="relative py-6 px-10 sm:px-6 lg:px-8"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,182,193,0.3), rgba(173,216,230,0.3))",
      }}
    >
      {/* Controles de búsqueda y filtros */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        {/* Search */}
        <div className="flex items-center bg-white px-3 py-2 rounded-full shadow-md w-full md:w-1/3">
          <FiSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="outline-none flex-1"
          />
        </div>

        {/* Categorías */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(0);
          }}
          className="px-4 py-2 rounded-full shadow-md bg-white"
        >
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat === "all" ? "Todas las categorías" : cat}
            </option>
          ))}
        </select>

        {/* Orden por precio */}
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setCurrentPage(0);
          }}
          className="px-4 py-2 rounded-full shadow-md bg-white"
        >
          <option value="none">Ordenar por precio</option>
          <option value="asc">Menor a mayor</option>
          <option value="desc">Mayor a menor</option>
        </select>
      </div>

      {/* Navegación para desktop */}
      {!isMobile && totalPages > 1 && (
        <>
          <motion.button
            onClick={handlePrev}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full shadow-lg bg-gradient-to-r from-pink-400 to-purple-500 text-white"
          >
            <FiChevronLeft className="w-7 h-7" />
          </motion.button>

          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full shadow-lg bg-gradient-to-r from-pink-400 to-purple-500 text-white"
          >
            <FiChevronRight className="w-7 h-7" />
          </motion.button>
        </>
      )}

      {/* Cards */}
      {productsToShow.length > 0 ? (
        <div className="relative z-10 min-h-[500px]">
          {isMobile ? (
            <motion.div
              key={`mobile-${visibleProducts}`}
              variants={containerVariants}
              initial={hasAnimated ? "visible" : "hidden"}
              animate={controls}
              className={`grid gap-6 ${
                width < 768
                  ? "grid-cols-1"
                  : width < 1024
                  ? "grid-cols-2"
                  : "grid-cols-3"
              }`}
            >
              {productsToShow.map((product) => (
                <motion.div
                  key={product.id}
                  variants={cardVariants}
                  whileHover="hover"
                  className="flex justify-center"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="relative h-full">
              <AnimatePresence custom={direction} initial={false}>
                <motion.div
                  key={currentPage}
                  custom={direction}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={pageTransition}
                  className={`grid gap-6 ${
                    width < 768
                      ? "grid-cols-2"
                      : width < 1024
                      ? "grid-cols-3"
                      : "grid-cols-4"
                  }`}
                >
                  {productsToShow.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={cardVariants}
                      whileHover="hover"
                      className="flex justify-center"
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          No se encontraron productos
        </div>
      )}

      {/* Botón "Cargar más" para móviles */}
      {isMobile && visibleProducts < filteredProducts.length && (
        <div className="flex justify-center mt-8">
          <motion.button
            onClick={loadMoreProducts}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 rounded-full shadow-lg bg-gradient-to-r from-pink-400 to-purple-500 text-white"
          >
            <FiPlus className="w-5 h-5" />
            Cargar más productos
          </motion.button>
        </div>
      )}

      {/* Indicadores de página para desktop */}
      {!isMobile && totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setDirection(idx > currentPage ? 1 : -1);
                setCurrentPage(idx);
              }}
              whileHover={{ scale: 1.2 }}
              className={`w-3 h-3 rounded-full ${
                currentPage === idx
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 w-6"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CardsContainer;
