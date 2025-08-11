import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(db, "orders"));

      const ordersData = await Promise.all(
        querySnapshot.docs.map(async (orderDoc) => {
          const orderData = orderDoc.data();
          // Obtener datos del usuario
          let customerData = null;
          if (orderData.userId) {
            const userSnap = await getDoc(doc(db, "users", orderData.userId));
            customerData = userSnap.exists() ? userSnap.data() : null;
          }

          return {
            id: orderDoc.id,
            ...orderData,
            customer: customerData,
            createdAt: orderData.createdAt?.toDate() || null,
            updatedAt: orderData.updatedAt?.toDate() || null,
            // Estado de entrega (si no existe, lo inicializa)
            orderStatus: orderData.orderStatus || "en_preparacion",
          };
        })
      );

      // Ordenar por fecha más reciente
      ordersData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(ordersData);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  // Actualizar estado de entrega (simulado)
  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        orderStatus: newStatus,
        updatedAt: new Date(),
      });
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error al actualizar:", error);
    } finally {
      setUpdating(null);
    }
  };

  // Badges para estados
  const getStatusBadge = (status) => {
    const statusMap = {
      en_preparacion: {
        color: "bg-blue-100 text-blue-800",
        text: "En preparación",
      },
      en_camino: { color: "bg-yellow-100 text-yellow-800", text: "En camino" },
      entregado: { color: "bg-green-100 text-green-800", text: "Entregado" },
      cancelado: { color: "bg-red-100 text-red-800", text: "Cancelado" },
    };

    const statusInfo = statusMap[status] || {
      color: "bg-gray-100 text-gray-800",
      text: "Desconocido",
    };

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}
      >
        {statusInfo.text}
      </span>
    );
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
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Órdenes</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay órdenes
            </h3>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Orden #{order.id.slice(0, 8)}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {order.createdAt?.toLocaleDateString("es-AR") ||
                        "Fecha desconocida"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(order.orderStatus)}
                    <span className="text-sm font-medium text-gray-900">
                      ${order.total?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Cliente
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order.customer
                          ? `${order.customer.firstName} ${order.customer.lastName} (${order.customer.email})`
                          : "Usuario no registrado"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <h3 className="text-sm font-medium text-gray-900">
                        Método de pago
                      </h3>
                      <p className="text-sm text-gray-500">MercadoPago</p>
                      {order.payer && (
                        <p className="text-sm text-gray-500 mt-1">
                          {order.payer}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      Dirección de envío
                    </h3>
                    <p className="text-sm text-gray-500">
                      {order.customer?.address
                        ? `${order.customer.address.street}, ${order.customer.address.city} (${order.customer.address.postalCode})`
                        : "No especificada"}
                    </p>
                  </div>

                  <h3 className="text-sm font-medium text-gray-900 mt-3 mb-1">
                    Productos
                  </h3>
                  <ul className="divide-y divide-gray-200">
                    {(order.items || []).map((item, idx) => (
                      <li key={idx} className="py-2 flex justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                            {(item.image || item.imageUrl) && (
                              <img
                                src={item.image || item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${item.price} x {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                    <div className="flex space-x-2">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        disabled={updating === order.id}
                        className="text-sm border rounded p-1"
                      >
                        <option value="en_preparacion">En preparación</option>
                        <option value="en_camino">En camino</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                      {updating === order.id && (
                        <span className="text-xs text-gray-500">
                          Actualizando...
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <h3 className="text-sm font-medium text-gray-900">
                        Total
                      </h3>
                      <p className="text-lg font-bold text-gray-900">
                        ${order.total?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
