import { useState, useEffect } from "react";
import { loginUser, validateToken, refreshAccessToken } from "../api/authAPI";

export function useAuth() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // === Auto-login al iniciar la app ===
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access_token");
      const refresh = localStorage.getItem("refresh_token");
      const userData = localStorage.getItem("user");

      if (!token || !refresh || !userData) return;

      try {
        const res = await validateToken(token);

        if (res.valid) {
          setUser(JSON.parse(userData));
        } else if (res.error === "expired") {
          // Intentar renovar con refresh
          const refreshRes = await refreshAccessToken(refresh);
          if (refreshRes.access_token) {
            localStorage.setItem("access_token", refreshRes.access_token);
            setUser(JSON.parse(userData));
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error("Error al validar sesión:", err);
        logout();
      }
    };

    initAuth();
  }, []);

  // === Login normal ===
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await loginUser(email, password);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // === Logout ===
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return { user, loading, error, login, logout };
}
