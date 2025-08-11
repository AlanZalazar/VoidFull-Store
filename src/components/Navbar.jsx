import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { FiUser, FiLogOut, FiShoppingBag, FiEye } from "react-icons/fi";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const NavBar = () => {
  const { user, logout } = useAuth();
  const { cartItems = [] } = useCart();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userInitials, setUserInitials] = useState("");
  const [userFirstName, setUserFirstName] = useState("");
  const [userData, setUserData] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Calcular el total de productos en el carrito
  const totalCartItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Lógica de click fuera del menú
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Obtener datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          // 1. Intenta obtener de Firebase Auth primero
          if (user.displayName) {
            const [firstName] = user.displayName.split(" ");
            setUserFirstName(firstName);
            setUserInitials(firstName[0].toUpperCase());
            return;
          }

          // 2. Si no, busca en Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);

            // Prioridad: firstName > name > email
            const nameToUse =
              data.firstName || data.name || user.email.split("@")[0];
            setUserFirstName(nameToUse);
            setUserInitials(nameToUse[0].toUpperCase());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback al email
          if (user.email) {
            const emailName = user.email.split("@")[0];
            setUserFirstName(emailName);
            setUserInitials(emailName[0].toUpperCase());
          }
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    const res = await logout();
    if (res.success) navigate("/login");
  };

  // Función para obtener el nombre a mostrar
  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (userData?.firstName) return userData.firstName;
    if (userData?.name) return userData.name;
    return user?.email?.split("@")[0] || "Usuario";
  };

  return (
    <nav className="sticky top-0 z-50 px-6 py-3 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-md border-b border-white/20 shadow-lg shadow-cyan-500/10">
      <div className="max-w-8xl mx-auto flex items-center justify-between">
        {/* Logo y nombre */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.png" alt="logo" className="h-10" />
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-pink-500 bg-clip-text text-transparent group-hover:from-pink-500 group-hover:to-cyan-500 transition-all duration-500">
            VoidFull-Store
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {/* Carrito con mejor contraste */}
          <Link to="/cart" className="relative group">
            <div className="p-2 rounded-full bg-white/30 group-hover:bg-white/40 transition-all duration-300">
              <ShoppingCartIcon className="h-6 w-6 text-gray-800" />
            </div>
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce">
                {totalCartItems}
              </span>
            )}
          </Link>

          {/* Usuario */}
          {user ? (
            <div className="relative flex items-center gap-4" ref={menuRef}>
              {/* Saludo personalizado con mejor contraste */}
              <div className="hidden md:block text-sm font-medium text-gray-800">
                Hola,{" "}
                <span className="font-bold">
                  {userFirstName || getDisplayName()}
                </span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-pink-500 text-white font-bold flex items-center justify-center shadow-lg hover:from-pink-500 hover:to-cyan-400 transition-all duration-300 relative"
                >
                  {userInitials}
                  {isProfileOpen && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-white/80 animate-pulse"></span>
                  )}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-white/20 backdrop-blur-md overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-medium text-gray-900">
                        {getDisplayName()} {userData.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      {user.role === "admin" && (
                        <>
                          <button
                            onClick={() => {
                              navigate("/admin");
                              setIsProfileOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200"
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
                          <button
                            onClick={() => {
                              navigate("/");
                              setIsProfileOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200"
                          >
                            <FiEye className="h-4 w-4 mr-2 text-blue-500" />
                            Ver como cliente
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          navigate("/perfil");
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200"
                      >
                        <FiUser className="h-4 w-4 mr-2 text-cyan-500" />
                        Mi perfil
                      </button>

                      <button
                        onClick={() => {
                          navigate("/mis-compras");
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200"
                      >
                        <FiShoppingBag className="h-4 w-4 mr-2 text-purple-500" />
                        Mis compras
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-pink-600 hover:bg-gray-100 transition-all duration-200"
                      >
                        <FiLogOut className="h-4 w-4 mr-2" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 shadow-md"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all duration-300 shadow-md"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
