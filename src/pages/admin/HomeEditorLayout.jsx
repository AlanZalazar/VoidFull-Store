import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function HomeEditorLayout() {
  const { user, authLoading } = useAuth();

  if (authLoading) return <div>Cargando...</div>;

  if (!user || user.role !== "admin") {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}
