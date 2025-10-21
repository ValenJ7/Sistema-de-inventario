import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { ShoppingBag, User, Menu, Search, X } from "lucide-react";

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] text-[#222] font-[Inter]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-t-4 border-[#1A1A1A] shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          {/* IZQUIERDA: MENÚ + LOGO */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-800 hover:text-black transition-colors"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link to="/tienda" className="flex items-center">
              <img
                src="/logo.png" // 🔹 asegurate que esté en /public/logo.png
                alt="J7"
                className="h-8 object-contain"
              />
            </Link>
          </div>

          {/* DERECHA: ÍCONOS */}
          <div className="flex items-center gap-6 text-gray-800">
            <button className="hover:text-black transition-colors" title="Buscar">
              <Search size={22} />
            </button>
            <Link
              to="/login"
              className="hover:text-black transition-colors"
              title="Cuenta"
            >
              <User size={22} />
            </Link>
            <Link
              to="/carrito"
              className="hover:text-black transition-colors"
              title="Carrito"
            >
              <ShoppingBag size={22} />
            </Link>
          </div>
        </div>

        {/* MENÚ DESPLEGABLE */}
        {menuOpen && (
          <div className="bg-white border-t border-gray-200 shadow-md animate-fadeIn p-6 flex flex-col gap-4 text-center text-lg font-medium text-gray-800">
            <Link
              to="/tienda"
              onClick={() => setMenuOpen(false)}
              className="hover:text-black"
            >
              Tienda
            </Link>
            <Link
              to="/categorias"
              onClick={() => setMenuOpen(false)}
              className="hover:text-black"
            >
              Categorías
            </Link>
            <Link
              to="/novedades"
              onClick={() => setMenuOpen(false)}
              className="hover:text-black"
            >
              Novedades
            </Link>
            <Link
              to="/contacto"
              onClick={() => setMenuOpen(false)}
              className="hover:text-black"
            >
              Contacto
            </Link>
          </div>
        )}
      </header>

      {/* CONTENIDO */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-[#F7F7F7] border-t border-gray-200 text-center text-gray-600 py-4 text-sm">
        © {new Date().getFullYear()} J7. Todos los derechos reservados.
      </footer>
    </div>
  );
}
