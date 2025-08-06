import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

function MisCompras() {
  const [user] = useAuthState(auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);

        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("❌ Error al obtener órdenes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Necesitás iniciar sesión
        </h1>
        <p className="text-gray-600">Inicia sesión para ver tus compras.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-600">Cargando tus compras...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">
          No tenés compras todavía
        </h1>
        <p className="text-gray-600">Cuando compres algo, aparecerá aquí.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mis Compras</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow-md rounded-xl p-6 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">
                {order.createdAt?.toDate().toLocaleString() ||
                  "Fecha desconocida"}
              </p>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : order.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            <ul className="divide-y divide-gray-200 mb-4">
              {order.items.map((item, index) => (
                <li key={index} className="flex justify-between py-2">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>${item.price * item.quantity}</span>
                </li>
              ))}
            </ul>

            <p className="text-right font-bold text-lg text-gray-800">
              Total: ${order.total}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MisCompras;
