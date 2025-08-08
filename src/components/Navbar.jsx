import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const NavBar = () => {
  const { user, logout } = useAuth();
  const { cartItems = [] } = useCart();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userInitials, setUserInitials] = useState("");
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // 🔹 Lógica de click fuera del menú
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user?.displayName) {
      const [firstName = "", lastName = ""] = user.displayName.split(" ");
      const initials = `${firstName[0] || ""}${
        lastName[0] || ""
      }`.toUpperCase();
      setUserInitials(initials);
    } else if (user?.email) {
      setUserInitials(user.email[0].toUpperCase());
    }
  }, [user]);

  const handleLogout = async () => {
    const res = await logout();
    if (res.success) navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b sticky top-0 z-50 dark:bg-[#121212] dark:border-gray-800">
      <Link to="/" className="flex items-center">
        <img src="/logo.png" alt="logo" className="h-10" />
      </Link>

      <div className="flex items-center gap-4">
        {user?.role === "admin" && (
          <Link
            to="/admin"
            className="hidden md:flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            Dashboard
          </Link>
        )}

        <Link to="/cart" className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-700 dark:text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cartItems.length}
            </span>
          )}
        </Link>

        {user ? (
          <div className="relative flex items-center gap-2" ref={menuRef}>
            <span className="hidden md:block text-gray-700 dark:text-[#e0e0e0]">
              Hola,{" "}
              <span className="font-bold text-[#0d47a1] dark:text-[#ffb400]">
                {user.displayName?.split(" ")[0] || "Usuario"}
              </span>
            </span>
            <button
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white font-bold flex items-center justify-center shadow"
            >
              {userInitials}
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 z-50 border divide-y dark:bg-[#181818] dark:border-[#2b2b2b] dark:divide-gray-700">
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-[#2196f3]">
                    {user.displayName || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
                <div>
                  {user.role === "admin" && (
                    <button
                      onClick={() => {
                        navigate("/admin");
                        setIsProfileOpen(false);
                      }}
                      className="md:hidden flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:text-white dark:hover:bg-[#2b2b2b] transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2 text-purple-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                      Dashboard Admin
                    </button>
                  )}
                  <button
                    onClick={() => {
                      navigate("/perfil");
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:text-white dark:hover:bg-[#2b2b2b] transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Mi perfil
                  </button>
                  <button
                    onClick={() => {
                      navigate("/mis-compras");
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:text-white dark:hover:bg-[#2b2b2b] transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Mis compras
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-200 hover:text-red-800 dark:hover:bg-[#2b2b2b] transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-4 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 text-sm rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
