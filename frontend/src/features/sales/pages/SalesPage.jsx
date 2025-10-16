// features/sales/pages/SalesPage.jsx
import { useMemo, useRef, useState } from "react";
import useSales from "../hooks/useSales";               // <- ahora también maneja createSale()
import useProducts from "../../products/hooks/useProducts";
import useDebouncedValue from "../hooks/useDebouncedValue";
import { money } from "../../../utils/money";

import SearchBar from "../components/SearchBar";
import CategoryChips from "../components/CategoryChips";
import ProductGrid from "../components/ProductGrid";
import CartPanel from "../components/CartPanel";

import AlertModal from "../../../ui/AlertModal";
import ConfirmModal from "../../../ui/ConfirmModal";
import Toast from "../../../ui/Toast";

export default function SalesPage() {
  const { products, reload: reloadProducts } = useProducts();

  // Hook de carrito + venta
  const {
    items: cart,
    subtotal: subTotal,
    getQty,
    addToCart,
    inc,
    dec,
    remove,
    createSale,               // <-- ahora viene del hook
  } = useSales(products);

  // UI state
  const [alert, setAlert] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filtros
  const searchRef = useRef(null);
  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q, 300);
  const [categoryFilter, setCategoryFilter] = useState("");

  const TAX_RATE = 0.16;

  /* ===== Helpers ===== */
  const findProduct = (pid) => products.find((p) => p.id === pid) || null;
  const findVariant = (p, vid) => (p?.variants || []).find((v) => v.id === vid) || null;

  const updateQty = (pid, vid, qty) => {
    const p = findProduct(pid);
    const v = findVariant(p, vid);
    const available = v ? Number(v.stock || 0) : Number(p?.stock_total ?? p?.stock ?? 0);
    const target = Math.max(1, Math.min(Number(qty || 1), available));
    const current = cart.find((i) => i.product_id === pid && (i.variant_id ?? null) === (vid ?? null))?.quantity ?? 0;
    if (target === current) return;

    if (target < current) {
      for (let i = 0; i < current - target; i++) dec(pid, vid);
    } else {
      for (let i = 0; i < target - current; i++) inc(pid, vid);
    }
  };

  const requestRemove = (pid, vid = null) => {
    const it = cart.find((i) => i.product_id === pid && (i.variant_id ?? null) === (vid ?? null));
    setConfirm({
      message: `¿Eliminar "${it?.name}${it?.size ? ` (${it.size})` : ""}" del carrito?`,
      onConfirm: () => {
        remove(pid, vid);
        setConfirm(null);
        setToast({ type: "info", message: "Producto eliminado" });
      },
    });
  };

  /* ===== Guardar venta ===== */
  const confirmSale = async () => {
    if (!cart.length || isSaving) return;

    // Rechequeo de stock antes de enviar
    for (const it of cart) {
      const p = findProduct(it.product_id);
      if (!p) continue;
      const v = findVariant(p, it.variant_id ?? null);
      const available = v ? Number(v.stock || 0) : Number(p.stock_total ?? p.stock ?? 0);
      if (it.quantity > available) {
        setAlert({
          type: "warning",
          message: `Stock insuficiente: ${p.name}${it.size ? ` (${it.size})` : ""} (stock ${available})`,
        });
        return;
      }
    }

    setIsSaving(true);

    const payload = cart.map((c) => ({
      product_id: c.product_id,
      variant_id: c.variant_id ?? null,
      size: c.size ?? null,
      quantity: c.quantity,
      price: c.price,
    }));

    const res = await createSale(payload);  // <--- usa la del hook
    setIsSaving(false);

    if (res?.success) {
      setToast({
        type: "success",
        message: `Venta creada #${res.data.sale_id} por ${money(res.data.total)}`,
      });

      for (const it of cart) remove(it.product_id, it.variant_id ?? null);
      reloadProducts(); // recargar stock
    } else {
      setAlert({
        type: "error",
        message: res?.error || "No se pudo registrar la venta",
      });
    }
  };

  const holdSale = () =>
    setToast({
      type: "info",
      message: "Venta guardada (en espera) — pronto lo implementamos",
    });

  /* ===== Filtros y datasets ===== */
  const categories = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      if (p.category_id != null)
        map.set(String(p.category_id), p.category_name ?? `Cat. ${p.category_id}`);
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
              getQty={(pid, vid) => getQty(pid, vid)}
              onAdd={(prod, variant) => addToCart(prod, variant)}
              onInc={(pid, vid) => inc(pid, vid)}
              onDec={(pid, vid) => dec(pid, vid)}
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
              onDec={(pid, vid) => dec(pid, vid)}
              onInc={(pid, vid) => inc(pid, vid)}
              onRemove={(pid, vid) => requestRemove(pid, vid)}
              onConfirmSale={confirmSale}
              onHoldSale={holdSale}
              onUpdateQty={(pid, vid, qty) => updateQty(pid, vid, qty)}
            />
          </aside>
        </div>
      </div>

      {/* Modales & Toasts */}
      {alert && (
        <AlertModal
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
