import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const [isValid, setIsValid] = useState(null); // null = cargando
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    // Si no hay usuario o token, redirigimos al login
    if (!user || !token) {
      setIsValid(false);
      setLoading(false);
      return;
    }

    // Validar el token con el backend
    const validateToken = async () => {
      try {
        const res = await fetch(
          "http://localhost/SistemaDeInventario/backend/auth/validate.php",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (data.valid) {
          // Si hay restricción de rol, se verifica
          if (role && user.role !== role) {
            setIsValid(false);
          } else {
            setIsValid(true);
          }
        } else {
          // Token inválido o expirado
          localStorage.clear();
          setIsValid(false);
        }
      } catch (error) {
        console.error("Error validando token:", error);
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [role]);

  // Mientras valida el token, mostrar un cargando simple
  if (loading) return <p className="text-center mt-10">Verificando sesión...</p>;

  // Si no está validado, redirigir al login
  if (!isValid) return <Navigate to="/login" replace />;

  // Si está todo bien, renderizar el contenido protegido
  return children;
}
