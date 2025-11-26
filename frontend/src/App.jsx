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

// 🟦 Pedidos (nuevo módulo)
import OrdersList from "./features/orders/pages/OrdersList";
import OrderDetail from "./features/orders/pages/OrderDetail";

// Carrito
import { CartProvider } from "./features/cart/CartContext";
import CheckoutPage from "./features/cart/pages/CheckoutPage";
import ShippingPage from "./features/cart/pages/ShippingPage";

// Resultados de pago
import SuccessPage from "./features/cart/pages/SuccessPage";
import FailurePage from "./features/cart/pages/FailurePage";
import PendingPage from "./features/cart/pages/PendingPage";

// Autenticación
import AuthPage from "./features/auth/pages/AuthPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Bloque Admin protegido */}
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

          {/* 🟦 NUEVO: Pedidos */}
          <Route path="/pedidos" element={<OrdersList />} />
          <Route path="/pedidos/:id" element={<OrderDetail />} />
        </Route>

        {/* 🔹 Login y Registro */}
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

          {/* Checkout */}
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* Paso de envío (solo clientes) */}
          <Route
            path="/checkout/shipping"
            element={
              <ProtectedRoute role="customer">
                <ShippingPage />
              </ProtectedRoute>
            }
          />

          {/* Resultado de pagos */}
          <Route path="/checkout/success" element={<SuccessPage />} />
          <Route path="/checkout/failure" element={<FailurePage />} />
          <Route path="/checkout/pending" element={<PendingPage />} />
        </Route>
      </Routes>

      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </Router>
  );
}
