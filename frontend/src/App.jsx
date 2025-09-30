import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // 👈 import
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";
import HomePage from "./pages/HomePage";
import InventoryPage from "./features/products/pages/InventoryPage";
import CategoryPage from "./features/category/pages/CategoryPage";
import Tienda from "./features/catalog/pages/Tienda";
import Producto from "./features/catalog/pages/Producto";
import SalesPage from "./features/sales/pages/SalesPage";
import ReportsPage from "./features/reports/pages/ReportsPage";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Bloque Admin con sidebar */}
        <Route element={<AdminLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/ventas" element={<SalesPage />} />
          <Route path="/reportes" element={<ReportsPage />} />
          <Route path="/inventario" element={<InventoryPage />} />
          <Route path="/categorias" element={<CategoryPage />} />
        </Route>

        {/* 🔹 Bloque Público (sin sidebar) */}
        <Route element={<PublicLayout />}>
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/producto/:slug" element={<Producto />} />
        </Route>
      </Routes>

      {/* 🔔 Toaster global */}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </Router>
  );
}
