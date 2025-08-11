import { motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
import { useInView } from "react-intersection-observer";

const CardsContainer = ({ products, category }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1 });
  const containerRef = useRef(null);

  const [isHoveringContainer, setIsHoveringContainer] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // 🔍 Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");

  // 🖥 Mostrar más cards por página (8 mínimo)
  const productsPerPage =
    window.innerWidth < 640 ? 2 : window.innerWidth < 1024 ? 4 : 8;

  // ✨ Animación de aparición
  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  // 📂 Obtener categorías únicas
  const categories = ["all", ...new Set(products.map((p) => p.category))];

  // 🔄 Filtrar, buscar y ordenar
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

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };
  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const paginatedProducts = filteredProducts.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );

  // 🎭 Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
    hover: {
      y: -8,
      scale: 1.05,
      boxShadow: "0px 8px 25px rgba(0,0,0,0.15)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <section
      ref={ref}
      className="relative py-16 px-4 sm:px-6 lg:px-8"
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

      {/* Navegación */}
      {totalPages > 1 && (
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
      {paginatedProducts.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 relative z-10"
        >
          {paginatedProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={cardVariants}
              whileHover="hover"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          No se encontraron productos
        </div>
      )}

      {/* Indicadores */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrentPage(idx)}
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
