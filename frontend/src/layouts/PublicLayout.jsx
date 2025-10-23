import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { Menu, Search, X, ChevronDown } from "lucide-react";
import { useCategories } from "../features/catalog/hooks/useCategories";

// 🆕 Imports del carrito y usuario
import CartButton from "../features/cart/components/CartButton";
import CartDrawer from "../features/cart/components/CartDrawer";
import UserMenu from "../features/auth/components/UserMenu"; // 👈 Nuevo import

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 🧠 Estados globales
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Cargar categorías
  const { categories, loading } = useCategories();

  const handleSearchToggle = () => {
    if (searchOpen) setSearchTerm("");
    setSearchOpen(!searchOpen);
  };

  // 🧩 Escuchar evento global para abrir el carrito
  useEffect(() => {
    const handleOpen = () => setDrawerOpen(true);
    window.addEventListener("openCartDrawer", handleOpen);
    return () => window.removeEventListener("openCartDrawer", handleOpen);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] text-[#222] font-[Inter]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-t-4 border-[#1A1A1A] shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          {/* IZQUIERDA: MENÚ + LOGO */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setMenuOpen(!menuOpen);
                setSearchOpen(false);
              }}
              className="text-gray-800 hover:text-black transition-colors"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link to="/tienda" className="flex items-center">
              <img src="/logo.png" alt="J7" className="h-8 object-contain" />
            </Link>
          </div>

          {/* DERECHA: ÍCONOS */}
          <div className="flex items-center gap-6 text-gray-800">
            {/* 🔍 Buscar */}
            <button
              onClick={handleSearchToggle}
              className="hover:text-black transition-colors"
              title="Buscar"
            >
              {searchOpen ? <X size={22} /> : <Search size={22} />}
            </button>

            {/* 👤 Usuario (dinámico con UserMenu) */}
            <UserMenu />

            {/* 🛒 Carrito */}
            <CartButton onClick={() => setDrawerOpen(true)} />
          </div>
        </div>

        {/* 🔍 BARRA DE BÚSQUEDA */}
        {searchOpen && (
          <div className="border-t border-gray-200 bg-white py-5 px-8 flex items-center justify-center animate-slideDown">
            <div className="flex items-center w-full max-w-xl border-b border-gray-300 focus-within:border-black transition-colors">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="¿Qué estás buscando?"
                className="flex-1 text-lg focus:outline-none placeholder-gray-400 text-center sm:text-left"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="ml-3 text-gray-500 hover:text-black transition-colors flex items-center gap-1"
              >
                <Search size={20} />
                <span className="hidden sm:inline text-sm font-medium">
                  Buscar
                </span>
              </button>
            </div>
          </div>
        )}

        {/* MENÚ DESPLEGABLE */}
        {menuOpen && (
          <div className="bg-white border-t border-gray-200 shadow-md animate-fadeIn p-6 flex flex-col gap-4 text-center text-lg font-medium text-gray-800">
            <button
              onClick={() => {
                setSelectedCategory("");
                setMenuOpen(false);
              }}
              className="hover:text-black"
            >
              Tienda
            </button>

            {/* Categorías (acordeón) */}
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex justify-center items-center gap-2 mx-auto hover:text-black transition-colors"
              >
                Categorías
                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    categoriesOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {categoriesOpen && !loading && (
                <div className="flex flex-col gap-2 mt-4 text-base">
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setMenuOpen(false);
                    }}
                    className="hover:text-black"
                  >
                    Todas las categorías
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setMenuOpen(false);
                      }}
                      className="hover:text-black"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Resto del menú */}
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
        <Outlet
          context={{
            selectedCategory,
            setSelectedCategory,
            searchTerm,
            setSearchTerm,
            categories,
          }}
        />
      </main>

      {/* FOOTER */}
      <footer className="bg-[#F7F7F7] border-t border-gray-200 text-center text-gray-600 py-4 text-sm">
        © {new Date().getFullYear()} J7. Todos los derechos reservados.
      </footer>

      {/* 🛒 Drawer del carrito */}
      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCheckout={() => {
          setDrawerOpen(false);
          window.location.href = "/checkout";
        }}
      />
    </div>
  );
}
