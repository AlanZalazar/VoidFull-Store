// src/components/PrivateRouteAdmin.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRouteAdmin({ children }) {
  const { user } = useAuth();

  // Asegurate que tu usuario admin tenga este email por ejemplo
  const adminEmail = "admin@example.com";

  if (!user || user.email !== adminEmail) {
    return <Navigate to="/" />;
  }

  return children;
}
