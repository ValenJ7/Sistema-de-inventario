import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";

// Páginas principales
import HomePage from "./pages/HomePage";
import InventoryPage from "./features/products/pages/InventoryPage";
import CategoryPage from "./features/category/pages/CategoryPage";
import Tienda from "./features/catalog/pages/Tienda";
import Producto from "./features/catalog/pages/Producto";
import SalesPage from "./features/sales/pages/SalesPage";
import ReportsPage from "./features/reports/pages/ReportsPage";

// Carrito
import { CartProvider } from "./features/cart/CartContext";
import CheckoutPage from "./features/cart/pages/CheckoutPage";
import ShippingPage from "./features/cart/pages/ShippingPage"; // 👈 NUEVA PÁGINA

// Autenticación
import AuthPage from "./features/auth/pages/AuthPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Bloque Admin protegido (solo accesible si estás logueado como admin) */}
        <Route
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/ventas" element={<SalesPage />} />
          <Route path="/reportes" element={<ReportsPage />} />
          <Route path="/inventario" element={<InventoryPage />} />
          <Route path="/categorias" element={<CategoryPage />} />
        </Route>

        {/* 🔹 Login / Registro públicos */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 🔹 Bloque Público (tienda + carrito + checkout) */}
        <Route
          element={
            <CartProvider>
              <PublicLayout />
            </CartProvider>
          }
        >
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/producto/:slug" element={<Producto />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* 🚚 NUEVO PASO DE ENVÍO (protegido para clientes logueados) */}
          <Route
            path="/checkout/shipping"
            element={
              <ProtectedRoute role="customer">
                <ShippingPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>

      {/* 🔔 Toaster global */}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </Router>
  );
}
