import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Menu,
  Home,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  Package,
  Tags,
  LogOut,
  Store,
} from "lucide-react";
import toast from "react-hot-toast";

const linkBase =
  "px-2 py-1 text-sm font-medium transition-colors hover:opacity-90";
const linkClasses = ({ isActive }) =>
  `${linkBase} ${isActive ? "text-white" : "text-slate-300"}`;

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    } catch {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    toast.success("Sesión cerrada correctamente");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ===== TOP BAR ===== */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white shadow">
        <div className="mx-auto max-w-7xl h-14 px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 grid place-items-center rounded-md bg-white/10">
              🧾
            </div>
            <span className="text-lg font-semibold">Panel</span>
          </div>

          {/* ===== DESKTOP NAV ===== */}
          <nav className="hidden md:flex items-center gap-6">

            <NavLink to="/" end className={linkClasses}>
              <span className="inline-flex items-center gap-2">
                <Home size={16} /> Inicio
              </span>
            </NavLink>

            <NavLink to="/ventas" className={linkClasses}>
              <span className="inline-flex items-center gap-2">
                <ShoppingCart size={16} /> Ventas
              </span>
            </NavLink>

            {/* P E D I D O S */}
            <NavLink to="/pedidos" className={linkClasses}>
              <span className="inline-flex items-center gap-2">
                <ClipboardList size={16} /> Pedidos
              </span>
            </NavLink>

            {/* PARA DESPACHAR */}
            <NavLink to="/pedidos/despachar" className={linkClasses}>
              <span className="inline-flex items-center gap-2">
                <Package size={16} /> Para despachar
              </span>
            </NavLink>

            <NavLink to="/reportes" className={linkClasses}>
              <span className="inline-flex items-center gap-2">
                <BarChart3 size={16} /> Reportes
              </span>
            </NavLink>

            <NavLink to="/inventario" className={linkClasses}>
              <span className="inline-flex items-center gap-2">
                <Package size={16} /> Productos
              </span>
            </NavLink>

            <NavLink to="/categorias" className={linkClasses}>
              <span className="inline-flex items-center gap-2">
                <Tags size={16} /> Categorías
              </span>
            </NavLink>

            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/tienda")}
                className="ml-2 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
              >
                <Store size={16} /> Ver tienda
              </button>
            )}

            <button
              onClick={handleLogout}
              className="ml-4 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
            >
              <LogOut size={16} /> Salir
            </button>
          </nav>

          {/* ===== MOBILE BURGER ===== */}
          <button
            className="md:hidden p-2 rounded hover:bg-white/10"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu />
          </button>
        </div>

        {/* ===== MOBILE MENU ===== */}
        {open && (
          <nav className="md:hidden border-t border-white/10 bg-slate-900/95">
            <div className="px-4 py-2 flex flex-col gap-2">

              <NavLink to="/" end className={linkClasses} onClick={() => setOpen(false)}>
                <span className="inline-flex items-center gap-2">
                  <Home size={16} /> Inicio
                </span>
              </NavLink>

              <NavLink to="/ventas" className={linkClasses} onClick={() => setOpen(false)}>
                <span className="inline-flex items-center gap-2">
                  <ShoppingCart size={16} /> Ventas
                </span>
              </NavLink>

              {/* Pedidos */}
              <NavLink to="/pedidos" className={linkClasses} onClick={() => setOpen(false)}>
                <span className="inline-flex items-center gap-2">
                  <ClipboardList size={16} /> Pedidos
                </span>
              </NavLink>

              {/* Para despachar */}
              <NavLink
                to="/pedidos/despachar"
                className={linkClasses}
                onClick={() => setOpen(false)}
              >
                <span className="inline-flex items-center gap-2">
                  📦 Para despachar
                </span>
              </NavLink>

              <NavLink to="/reportes" className={linkClasses} onClick={() => setOpen(false)}>
                <span className="inline-flex items-center gap-2">
                  <BarChart3 size={16} /> Reportes
                </span>
              </NavLink>

              <NavLink to="/inventario" className={linkClasses} onClick={() => setOpen(false)}>
                <span className="inline-flex items-center gap-2">
                  <Package size={16} /> Productos
                </span>
              </NavLink>

              <NavLink to="/categorias" className={linkClasses} onClick={() => setOpen(false)}>
                <span className="inline-flex items-center gap-2">
                  <Tags size={16} /> Categorías
                </span>
              </NavLink>

              {user?.role === "admin" && (
                <button
                  onClick={() => {
                    navigate("/tienda");
                    setOpen(false);
                  }}
                  className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
                >
                  <Store size={16} /> Ver tienda
                </button>
              )}

              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white mt-2"
              >
                <LogOut size={16} /> Salir
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* ===== CONTENT ===== */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
