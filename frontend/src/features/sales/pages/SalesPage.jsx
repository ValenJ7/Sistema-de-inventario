import { useEffect, useMemo, useRef, useState } from "react";
import useSales from "../hooks/useSales";
import useProducts from "../../products/hooks/useProducts";
import useSaleItems from "../hooks/useSaleItems";
import AlertModal from "../../../ui/AlertModal";
import ConfirmModal from "../../../ui/ConfirmModal";
import Toast from "../../../ui/Toast";

/* =========================
   Utilidades y pequeños hooks
   ========================= */
function money(n) {
  const v = Number(n ?? 0);
  return v.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  });
}
function useDebouncedValue(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* =========================
   Iconitos inline (sin libs)
   ========================= */
const Icon = {
  Search: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...props}>
      <circle cx="11" cy="11" r="7" strokeWidth="2" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
    </svg>
  ),
  Cart: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...props}>
      <circle cx="9" cy="21" r="1.5" /><circle cx="19" cy="21" r="1.5" />
      <path d="M3 3h2l2.2 12.3a2 2 0 0 0 2 1.7h8.3a2 2 0 0 0 2-1.6L21 8H6" strokeWidth="2"/>
    </svg>
  ),
  Minus: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
    </svg>
  ),
  Plus: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" />
      <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" />
    </svg>
  ),
  Trash: (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" {...props}>
      <polyline points="3 6 5 6 21 6" strokeWidth="2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeWidth="2" />
      <path d="M10 11v6M14 11v6" strokeWidth="2" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" strokeWidth="2" />
    </svg>
  ),
  Card: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  Save: (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Box: (props) => (
    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" {...props}>
      <path d="M21 16V8l-9-5-9 5v8l9 5 9-5z" />
      <path d="M3.3 7.3L12 12l8.7-4.7" />
      <path d="M12 22V12" />
    </svg>
  ),
};

export default function SalesPage() {
  const { sales, loading, createSale, getSales } = useSales();
  const { products, reload: reloadProducts } = useProducts();
  const [cart, setCart] = useState([]);
  const [alert, setAlert] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Detalle (lo dejamos por si lo usás luego)
  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const { sale, loading: loadingItems, error } = useSaleItems(selectedSaleId);

  // Filtros
  const searchRef = useRef(null);
  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q, 300);

  const [categoryFilter, setCategoryFilter] = useState(""); // "" = todas

  // Tax como en el mock
  const TAX_RATE = 0.16;

  useEffect(() => { getSales(); }, []);

  /* ===== Carrito ===== */
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
    setCart((prev) => prev.flatMap((p) => (p.product_id === id ? (p.quantity - 1 <= 0 ? [] : [{ ...p, quantity: p.quantity - 1 }]) : [p])));
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

    // Stock rápido antes de enviar
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

  /* ===== Filtros y grilla ===== */
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
      const okQ = !ql || String(p.name ?? "").toLowerCase().includes(ql) || String(p.sku ?? "").toLowerCase().includes(ql);
      const okC = !categoryFilter || String(p.category_id ?? "") === categoryFilter;
      return okQ && okC;
    });
  }, [products, dq, categoryFilter]);

  /* ===== Totales ===== */
  const subTotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const taxes = subTotal * TAX_RATE;
  const total = subTotal + taxes;

  return (
    <div className="min-h-screen bg-[#FBF4EA]"> {/* fondo crema */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Gestión de Ventas (POS)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* ====== IZQUIERDA: filtros + productos ====== */}
          <div className="space-y-4">
            {/* Buscador */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon.Search />
              </span>
              <input
                ref={searchRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar productos…"
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 bg-white/70 focus:bg-white outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            {/* Chips de categoría */}
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  categoryFilter === "" ? "bg-black text-white border-black" : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setCategoryFilter("")}
              >
                Todos
              </button>
              {categories.map((c) => (
                <button
                  key={c.value}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    categoryFilter === c.value ? "bg-black text-white border-black" : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setCategoryFilter(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Grilla de tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((p) => {
                const out = Number(p.stock) <= 0;
                const low = !out && Number(p.stock) < 5;
                const inCart = cart.find((c) => c.product_id === p.id);

                return (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-3">
                    {/* Placeholder imagen */}
                    <div className="aspect-[4/3] rounded-xl bg-gray-50 grid place-items-center text-gray-400">
                      <Icon.Box />
                    </div>

                    <div className="mt-3">
                      <div className="text-sm text-gray-600 truncate">{p.name}</div>
                      <div className="text-lg font-semibold mt-1">{money(p.price)}</div>
                      <div className="mt-2">
                        {out ? (
                          <span className="inline-block text-xs px-2 py-0.5 rounded-md bg-red-100 text-red-700">Sin stock</span>
                        ) : low ? (
                          <span className="inline-block text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">Stock: {p.stock}</span>
                        ) : (
                          <span className="inline-block text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">Stock: {p.stock}</span>
                        )}
                      </div>

                      {/* Controles */}
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          disabled={out || !inCart}
                          onClick={() => decQty(p.id)}
                          className={`h-8 w-8 grid place-items-center rounded-full border ${out || !inCart ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}
                          title="Quitar 1"
                        >
                          <Icon.Minus />
                        </button>
                        <div className="min-w-8 text-center text-sm">{inCart ? inCart.quantity : 0}</div>
                        <button
                          disabled={out}
                          onClick={() => addToCart(p)}
                          className={`h-8 w-8 grid place-items-center rounded-full border ${out ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}
                          title="Agregar 1"
                        >
                          <Icon.Plus />
                        </button>

                        <button
                          disabled={out}
                          onClick={() => addToCart(p)}
                          className={`ml-auto px-3 h-8 rounded-xl text-sm text-white ${out ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-neutral-800"}`}
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="col-span-full text-sm text-gray-500 border rounded-xl p-4 bg-white/60">
                  No se encontraron productos para tu búsqueda.
                </div>
              )}
            </div>

            {/* (Dejamos el historial como está; si querés, lo ocultamos por ahora) */}
          </div>

          {/* ====== DERECHA: carrito sticky ====== */}
          <aside className="lg:sticky lg:top-6 space-y-3">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
              {/* Header carrito */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-semibold">
                  <Icon.Cart />
                  <span>Carrito</span>
                  <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {cart.reduce((a, c) => a + c.quantity, 0)}
                  </span>
                </div>
              </div>

              {/* Items */}
              {cart.length === 0 ? (
                <p className="text-gray-500">No hay productos en el carrito.</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((c) => (
                    <div key={c.product_id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium truncate">{c.name}</div>
                        <div className="text-xs text-gray-500">{money(c.price)} c/u</div>
                      </div>

                      <button
                        onClick={() => decQty(c.product_id)}
                        className="h-8 w-8 grid place-items-center rounded-full bg-gray-100 hover:bg-gray-200"
                        title="Quitar 1"
                      >
                        <Icon.Minus />
                      </button>
                      <div className="w-8 text-center text-sm">{c.quantity}</div>
                      <button
                        onClick={() => incQty(c.product_id)}
                        className="h-8 w-8 grid place-items-center rounded-full bg-gray-100 hover:bg-gray-200"
                        title="Agregar 1"
                      >
                        <Icon.Plus />
                      </button>

                      <button
                        onClick={() => requestRemove(c.product_id)}
                        className="h-8 w-8 grid place-items-center rounded-full bg-red-100 text-red-700 hover:bg-red-200 ml-2"
                        title="Eliminar"
                      >
                        <Icon.Trash />
                      </button>
                    </div>
                  ))}

                  {/* Totales */}
                  <div className="mt-2 pt-2 border-t text-sm">
                    <div className="flex justify-between py-1">
                      <span>Subtotal:</span>
                      <span>{money(subTotal)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Impuestos ({Math.round(TAX_RATE * 100)}%):</span>
                      <span>{money(taxes)}</span>
                    </div>
                    <div className="flex justify-between py-2 mt-2 border-t font-semibold text-lg">
                      <span>Total:</span>
                      <span>{money(total)}</span>
                    </div>
                  </div>

                  {/* Botones */}
                  <button
                    onClick={confirmSale}
                    disabled={isSaving || cart.length === 0}
                    className={`w-full h-11 rounded-xl text-white font-medium flex items-center justify-center gap-2 ${
                      isSaving ? "bg-emerald-400 cursor-not-allowed" : "bg-black hover:bg-neutral-800"
                    }`}
                  >
                    <Icon.Card className="text-white" />
                    {isSaving ? "Procesando…" : "Procesar Pago"}
                  </button>

                  <button
                    onClick={holdSale}
                    className="w-full h-11 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
                  >
                    <Icon.Save />
                    Guardar Venta
                  </button>
                </div>
              )}
            </div>
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
