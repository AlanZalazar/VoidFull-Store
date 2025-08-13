// src/pages/MisCompras.jsx
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import BackButton from "../Hooks/backButton";

function MisCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCompras([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCompras(data);
      } catch (error) {
        console.error("Error obteniendo compras:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Cargando tus compras...</p>;
  }

  if (compras.length === 0) {
    return (
      <div className="text-center mt-10">
        <p className="text-gray-600">No tenés compras todavía</p>
        <p className="text-sm text-gray-500">
          Cuando compres algo, aparecerá aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6">Mis Compras</h1>
        <BackButton></BackButton>
      </div>
      <div className="space-y-6">
        {compras.map((compra) => (
          <div
            key={compra.id}
            className="border rounded-lg p-4 shadow-sm bg-white"
          >
            <p className="text-sm text-gray-500">
              Fecha:{" "}
              {compra.createdAt?.toDate
                ? compra.createdAt.toDate().toLocaleString()
                : "Sin fecha"}
            </p>
            <p
              className={`font-semibold ${
                compra.status === "approved"
                  ? "text-green-600"
                  : compra.status === "pending"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              Estado: {compra.status}
            </p>
            <ul className="mt-3 space-y-2">
              {compra.items.map((item, idx) => (
                <li key={idx} className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span>{item.name}</span>
                  </div>
                  <span>
                    {item.quantity} x ${item.price}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-bold">Total: ${compra.total}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MisCompras;
