import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { validateToken, refreshAccessToken } from "../api/authAPI";

export default function ProtectedRoute({ children, role }) {
  const [isValid, setIsValid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("access_token");
      const refresh = localStorage.getItem("refresh_token");

      if (!user || !token || !refresh) {
        setIsValid(false);
        setLoading(false);
        return;
      }

      try {
        const res = await validateToken(token);

        if (res.valid) {
          if (role && user.role !== role) setIsValid(false);
          else setIsValid(true);
        } else if (res.error === "expired") {
          // Renovar token automáticamente
          const refreshRes = await refreshAccessToken(refresh);
          if (refreshRes.access_token) {
            localStorage.setItem("access_token", refreshRes.access_token);
            setIsValid(true);
          } else {
            localStorage.clear();
            setIsValid(false);
          }
        } else {
          localStorage.clear();
          setIsValid(false);
        }
      } catch (err) {
        console.error("Error validando token:", err);
        localStorage.clear();
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [role]);

  if (loading) return <p className="text-center mt-10">Verificando sesión...</p>;
  if (!isValid) return <Navigate to="/login" replace />;
  return children;
}
