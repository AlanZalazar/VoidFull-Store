import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg p-6">
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
    </div>
  );
}
