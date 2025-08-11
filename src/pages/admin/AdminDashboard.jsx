import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function AdminDashboard() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Carga de componentes desde Firestore
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "components"));
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComponents(docs);
      } catch (error) {
        console.error("Error fetching components:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, []);

  const toggleActive = async (id, currentState) => {
    try {
      // Actualizar Firestore
      await updateDoc(doc(db, "components", id), {
        active: !currentState,
      });

      // Actualizar estado local
      setComponents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: !currentState } : c))
      );
    } catch (error) {
      console.error("Error updating component:", error);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando editor...</div>;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/admin/users"
            className="bg-blue-50 hover:bg-blue-100 transition-all duration-200 rounded-lg p-6 shadow-sm border border-blue-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Usuarios</h2>
                <p className="text-sm text-gray-500">Administrar usuarios</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/products"
            className="bg-green-50 hover:bg-green-100 transition-all duration-200 rounded-lg p-6 shadow-sm border border-green-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Productos</h2>
                <p className="text-sm text-gray-500">Administrar productos</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-yellow-50 hover:bg-yellow-100 transition-all duration-200 rounded-lg p-6 shadow-sm border border-yellow-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Órdenes</h2>
                <p className="text-sm text-gray-500">Ver todas las órdenes</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/products/new"
            className="bg-purple-50 hover:bg-purple-100 transition-all duration-200 rounded-lg p-6 shadow-sm border border-purple-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Nuevo Producto
                </h2>
                <p className="text-sm text-gray-500">Crear nuevo producto</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ADMIN EDITOR */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Admin Editor</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {components.map(({ id, name, active, colors }) => (
            <div
              key={id}
              className="rounded-lg shadow-lg p-6 flex flex-col justify-between"
              style={{
                background: `linear-gradient(135deg, ${
                  colors?.[0] || "#ccc"
                }, ${colors?.[1] || "#999"})`,
                color: active ? "white" : "rgba(255,255,255,0.7)",
                minHeight: "220px",
              }}
            >
              <h3 className="text-2xl font-semibold mb-6 text-center select-none">
                {name}
              </h3>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => toggleActive(id, active)}
                  className={`px-5 py-2 rounded-md font-medium transition-colors duration-200 ${
                    active
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {active ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => navigate(`/admin/${id}`)}
                  className="px-5 py-2 rounded-md font-medium bg-gray-900 bg-opacity-30 hover:bg-opacity-50 transition"
                >
                  Configurar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
