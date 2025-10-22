import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // Si no hay usuario logueado → redirigir a login
  if (!user) return <Navigate to="/login" replace />;

  // Si hay restricción de rol y no coincide → redirigir al home público
  if (role && user.role !== role) return <Navigate to="/tienda" replace />;

  return children;
}
