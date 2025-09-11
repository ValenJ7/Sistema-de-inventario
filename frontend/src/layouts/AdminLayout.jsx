// ----------------------------------------------
// 🧱 MainLayout.jsx
// 🎯 Layout con sidebar + Outlet para rutas
// ----------------------------------------------
import { NavLink, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-gray-900 text-white p-4 space-y-3">
        <h2 className="text-xl font-bold mb-4">Panel</h2>
        <nav className="space-y-2">
          <NavLink to="/" className="block hover:underline">Inicio</NavLink>
          <NavLink to="/inventario" className="block hover:underline">Productos</NavLink>
          <NavLink to="/categorias" className="block hover:underline">Categorías</NavLink>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
