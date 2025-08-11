// src/components/AdminMenu.jsx
import { Link, useLocation } from "react-router-dom";

const AdminMenu = () => {
  const location = useLocation();

  // Mapeo para definir cuál ruta activa
  const links = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/users", label: "Usuarios" },
    { to: "/admin/products", label: "Productos" },
    { to: "/admin/orders", label: "Órdenes" },
  ];

  return (
    <nav className="flex space-x-8 border-b border-gray-200 mb-6">
      {links.map(({ to, label }) => {
        const isActive =
          location.pathname === to || location.pathname.startsWith(to + "/");
        return (
          <Link
            key={to}
            to={to}
            className={`pb-2 font-semibold ${
              isActive
                ? "border-b-4 border-indigo-600 text-indigo-700"
                : "border-b-4 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            } transition-colors duration-200`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
};

export default AdminMenu;
