import { useEffect, useMemo, useRef, useState } from "react";
import useSales from "../hooks/useSales";
import useProducts from "../../products/hooks/useProducts";
import useSaleItems from "../hooks/useSaleItems";
import useDebouncedValue from "../hooks/useDebouncedValue"; // ver nota abajo
import { money } from "../../../utils/money";
import { Icon } from "../../../utils/icons";

import SearchBar from "../components/SearchBar";
import CategoryChips from "../components/CategoryChips";
import ProductGrid from "../components/ProductGrid";
import CartPanel from "../components/CartPanel";

import AlertModal from "../../../ui/AlertModal";
import ConfirmModal from "../../../ui/ConfirmModal";
import Toast from "../../../ui/Toast";



export default function SalesPage() {
  const { createSale, getSales } = useSales();
  const { products, reload: reloadProducts } = useProducts();

  // UI state
  const [cart, setCart] = useState([]);
  const [alert, setAlert] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Detalle de venta (lo dejás si luego lo usás)
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const { sale, loading: loadingItems, error } = useSaleItems(selectedSaleId);

  // Filtros
  const searchRef = useRef(null);
  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q, 300);
  const [categoryFilter, setCategoryFilter] = useState(""); // "" = todas

  // Impuesto solo visual (no impacta backend)
  const TAX_RATE = 0.16;

  useEffect(() => {
    getSales();
  }, []);

  /* ===== Carrito: acciones ===== */
  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((p) => p.product_id === product.id);
      const maxStock = Number(product.stock ?? 0);
      if (found) {
        if (found.quantity + 1 > maxStock) {
          setToast({ type: "warning", message: `Stock insuficiente: quedan ${maxStock} de "${product.name}"` });
          return prev;
        }
        return prev.map((p) =>
          p.product_id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const incQty = (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    setCart((prev) =>
      prev.map((p) => {
        if (p.product_id !== id) return p;
        const max = Number(product.stock ?? 0);
        const next = Math.min(p.quantity + 1, max);
        if (next === p.quantity) {
          setToast({ type: "warning", message: `Stock máximo para ${product.name}` });
        }
        return { ...p, quantity: next };
      })
    );
  };

  const decQty = (id) => {
    setCart((prev) =>
      prev.flatMap((p) =>
        p.product_id === id ? (p.quantity - 1 <= 0 ? [] : [{ ...p, quantity: p.quantity - 1 }]) : [p]
      )
    );
  };

  const updateQty = (id, qty) => {
    setCart((prev) =>
      prev.map((p) => {
        if (p.product_id !== id) return p;
        const product = products.find((pr) => pr.id === id);
        const maxStock = Number(product?.stock ?? 0);
        const v = Math.max(1, Math.min(Number(qty || 1), maxStock));
        return { ...p, quantity: v };
      })
    );
  };

  const requestRemove = (id) => {
    const product = cart.find((p) => p.product_id === id);
    setConfirm({
      message: `¿Eliminar "${product?.name}" del carrito?`,
      onConfirm: () => {
        setCart((prev) => prev.filter((p) => p.product_id !== id));
        setConfirm(null);
        setToast({ type: "info", message: "Producto eliminado" });
      },
    });
  };

  const confirmSale = async () => {
    if (cart.length === 0 || isSaving) return;

    // Rechequeo rápido de stock antes de enviar
    for (const item of cart) {
      const product = products.find((p) => p.id === item.product_id);
      if (product && item.quantity > product.stock) {
        setAlert({ type: "warning", message: `Stock insuficiente: ${product.name} (stock ${product.stock})` });
        return;
      }
    }

    setIsSaving(true);
    const items = cart.map((c) => ({ product_id: c.product_id, quantity: c.quantity }));
    const res = await createSale(items);
    setIsSaving(false);

    if (res?.success) {
      setToast({ type: "success", message: `Venta creada #${res.data.sale_id} por ${money(res.data.total)}` });
      setCart([]);
      getSales();
      reloadProducts();
    } else {
      setAlert({ type: "error", message: "No se pudo registrar la venta" });
    }
  };

  const holdSale = () => setToast({ type: "info", message: "Venta guardada (en espera) — pronto lo implementamos" });

  /* ===== Filtros y datasets ===== */
  const categories = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      if (p.category_id != null) map.set(String(p.category_id), p.category_name ?? `Cat. ${p.category_id}`);
    }
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [products]);

  const filtered = useMemo(() => {
    const ql = dq.trim().toLowerCase();
    return products.filter((p) => {
      const okQ =
        !ql ||
        String(p.name ?? "").toLowerCase().includes(ql) ||
        String(p.sku ?? "").toLowerCase().includes(ql);
      const okC = !categoryFilter || String(p.category_id ?? "") === categoryFilter;
      return okQ && okC;
    });
  }, [products, dq, categoryFilter]);

  /* ===== Totales ===== */
  const subTotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const taxes = subTotal * TAX_RATE;
  const total = subTotal + taxes;

  return (
    <div className="min-h-screen bg-[#FBF4EA]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Gestión de Ventas (POS)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* IZQUIERDA */}
          <div className="space-y-4">
            <SearchBar
              inputRef={searchRef}
              value={q}
              onChange={setQ}
              placeholder="Buscar productos…"
            />

            <CategoryChips
              categories={categories}
              selected={categoryFilter}
              onSelect={setCategoryFilter}
            />

            <ProductGrid
              products={filtered}
              cart={cart}
              onAdd={addToCart}
              onInc={incQty}
              onDec={decQty}
            />
          </div>

          {/* DERECHA */}
          <aside className="lg:sticky lg:top-6">
            <CartPanel
              cart={cart}
              subTotal={subTotal}
              taxes={taxes}
              total={total}
              taxRate={TAX_RATE}
              isSaving={isSaving}
              onDec={decQty}
              onInc={incQty}
              onRemove={requestRemove}
              onConfirmSale={confirmSale}
              onHoldSale={holdSale}
            />
          </aside>
        </div>
      </div>

      {/* Modales & Toasts */}
      {alert && <AlertModal type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
