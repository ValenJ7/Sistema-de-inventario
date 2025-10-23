import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // si no existe, la lógica alternativa se usa
import toast from "react-hot-toast";

/**
 * UserMenu:
 * - Si NO hay user en localStorage: muestra icono que lleva a /login
 * - Si HAY user: muestra nombre (o icono) y un dropdown con "Mi cuenta" y "Cerrar sesión"
 * - Soporta logout llamando a useAuth().logout si existe, sino limpia localStorage
 */
export default function UserMenu() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  // Intentamos usar logout del hook si está disponible
  let authLogout;
  try {
    const auth = useAuth();
    authLogout = auth?.logout;
  } catch (e) {
    authLogout = null;
  }

  // Actualizar estado cuando localStorage cambie (otra pestaña o acciones internas)
  const onStorage = useCallback((e) => {
    if (e.key === "user" || e.key === "token") {
      try {
        setUser(JSON.parse(localStorage.getItem("user")));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [onStorage]);

  const handleLogout = async () => {
    try {
      // Si existe logout en useAuth, lo usamos (para limpiar estados globales)
      if (authLogout) {
        await authLogout();
      } else {
        // fallback: limpiar localStorage manualmente
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      toast.success("Sesión cerrada");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Error al cerrar sesión");
    }
  };

  if (!user) {
    // Usuario NO logueado
    return (
      <div className="flex items-center gap-2">
        <Link to="/login" className="flex items-center gap-2 text-sm">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="hidden md:inline">Iniciar sesión</span>
        </Link>
      </div>
    );
  }

  // Usuario logueado -> mostrar menu
  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100 transition"
        onClick={(e) => {
          // Toggle menú simple por atributo aria-expanded
          const el = e.currentTarget;
          const expanded = el.getAttribute("aria-expanded") === "true";
          el.setAttribute("aria-expanded", !expanded);
          const menu = document.getElementById("user-dropdown");
          if (menu) menu.classList.toggle("hidden");
        }}
        aria-expanded="false"
      >
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
          {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
        </div>
        <div className="hidden md:block text-sm">
          {user.name || user.email}
        </div>
        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="none">
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div
        id="user-dropdown"
        className="hidden absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-50"
      >
    

        {/* Si querés que admin vaya al panel se puede condicionar por role */}
        {user.role === "admin" ? (
          <Link
            to="/"
            className="block px-4 py-2 text-sm hover:bg-gray-50"
            onClick={() => {
              // cerrar menú
              const btn = document.querySelector('[aria-expanded="true"]');
              if (btn) {
                btn.setAttribute("aria-expanded", "false");
                const menu = document.getElementById("user-dropdown");
                if (menu) menu.classList.add("hidden");
              }
            }}
          >
            Panel admin
          </Link>
        ) : null}

        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
