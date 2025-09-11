import { Outlet, Link } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react"; // iconos para carrito y login

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 🔹 Header estilo tienda responsivo */}
      <header className="bg-gray-900 text-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Logo */}
        <div className="flex justify-center sm:justify-start">
          <Link to="/tienda" className="text-2xl font-bold">
            Tienda
          </Link>
        </div>

        {/* Acciones rápidas */}
        <div className="flex justify-center sm:justify-end space-x-4">
          <Link to="/carrito" className="hover:text-gray-300">
            <ShoppingCart />
          </Link>
          <Link to="/login" className="hover:text-gray-300">
            <User />
          </Link>
        </div>
      </header>

      {/* 🔹 Contenido dinámico */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>

      {/* 🔹 Footer */}
      <footer className="bg-gray-100 text-center text-gray-600 py-3">
        © {new Date().getFullYear()} Finance Game. Todos los derechos reservados.
      </footer>
    </div>
  );
}
