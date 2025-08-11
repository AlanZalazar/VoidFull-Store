import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import CardsContainer from "../components/CardsContainer";
import CarruselIzquierdo from "../components/CarruselIzquierdo";
import Footer from "../components/footer";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("active", "==", true)
        );
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(docs);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="bg-gray-50">
      <div className="flex">
        <div className="hidden md:block">
          <CarruselIzquierdo />
        </div>
        <div className="max-w-7xl mx-auto  ">
          <CardsContainer products={products} />
        </div>
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">No hay productos</div>
      )}
      <Footer></Footer>
    </main>
  );
}

export default Home;
