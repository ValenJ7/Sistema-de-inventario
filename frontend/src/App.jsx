import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import InventoryPage from "./features/products/pages/InventoryPage";
import CategoryPage from "./features/category/pages/CategoryPage";
import Tienda from "./features/catalog/pages/Tienda";
import Producto from "./features/catalog/pages/Producto";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/inventario" element={<InventoryPage />} />
          <Route path="/categorias" element={<CategoryPage />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/producto/:slug" element={<Producto />} />
        </Route>
      </Routes>
    </Router>
  );
}
