import { useEffect, useMemo, useRef, useState } from "react";
import useSales from "../hooks/useSales";
import useProducts from "../../products/hooks/useProducts";
import useSaleItems from "../hooks/useSaleItems";
import AlertModal from "../../../ui/AlertModal";
import ConfirmModal from "../../../ui/ConfirmModal";
import Toast from "../../../ui/Toast";

function money(n) {
  const v = Number(n ?? 0);
  return v.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });
}

// Debounce básico sin libs
function useDebouncedValue(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function SalesPage() {
  const { sales, loading, createSale, getSales } = useSales();
  const { products, reload: reloadProducts } = useProducts();

  const [cart, setCart] = useState([]);
  const [alert, setAlert] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedSaleId, setSelectedSaleId] = useState(null);
  const { sale, loading: loadingItems, error } = useSaleItems(selectedSaleId);

  const [selectedImage, setSelectedImage] = useState(null);

  // Filtros
  const searchRef = useRef(null);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [categoryFilter, setCategoryFilter] = useState("");

  // Cargar ventas
  useEffect(() => { getSales(); }, []);

  // Atajos de teclado: F2 (buscar), F4 (confirmar)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "F4") {
        e.preventDefault();
        if (!isSaving && cart.length > 0) confirmSale();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cart.length, isSaving]);

  // Helpers de carrito
  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((p) => p.product_id === product.id);
      const maxStock = product.stock;
      if (found) {
        if (found.quantity + 1 > maxStock) {
          setToast({ type: "warning", message: `Stock insuficiente: quedan ${maxStock} de "${product.name}"` });
          return prev;
        }
        const next = prev.map((p) =>
          p.product_id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
        setToast({ type: "success", message: `+1 a ${product.name}` });
        return next;
      }
      setToast({ type: "success", message: `Agregado: ${product.name}` });
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const incQty = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) =>
      prev.map((p) => {
        if (p.product_id !== productId) return p;
        const nextQty = Math.min(p.quantity + 1, product.stock ?? 0);
        if (nextQty === p.quantity) {
          setToast({ type: "warning", message: `Stock máximo alcanzado para ${product.name}` });
        }
        return { ...p, quantity: nextQty };
      })
    );
  };

  const decQty = (productId) => {
    setCart((prev) =>
      prev.flatMap((p) => {
        if (p.product_id !== productId) return [p];
        const nextQty = p.quantity - 1;
        return nextQty <= 0 ? [] : [{ ...p, quantity: nextQty }];
      })
    );
  };

  const updateQty = (id, qty) => {
    setCart((prev) =>
      prev.map((p) => {
        if (p.product_id === id) {
          const product = products.find((pr) => pr.id === id);
          const maxStock = product?.stock ?? 0;
          const newQty = Math.max(1, Math.min(Number(qty), maxStock));
          if (Number(qty) > maxStock) {
            setToast({ type: "warning", message: `Solo hay ${maxStock} unidades de "${product?.name ?? ""}"` });
          }
          return { ...p, quantity: newQty };
        }
        return p;
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
    // Verificar stock en memoria
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

  // Filtros (cliente)
  const categories = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      const id = p.category_id ?? null;
      const label = p.category_name ?? (id != null ? `Categoría ${id}` : null);
      if (id != null) map.set(String(id), label);
    }
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return products.filter((p) => {
      const okText =
        !q ||
        String(p.name ?? "").toLowerCase().includes(q) ||
        String(p.sku ?? "").toLowerCase().includes(q);
      const okCat = !categoryFilter || String(p.category_id ?? "") === categoryFilter;
      return okText && okCat;
    });
  }, [products, debouncedQuery, categoryFilter]);

  const totalCart = cart.reduce((acc, it) => acc + it.price * it.quantity, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestión de Ventas (POS)</h1>

      {/* Layout: productos + carrito sticky */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Columna izquierda: filtros + productos */}
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-3">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o SKU (F2)"
              className="flex-1 border rounded px-3 py-2"
            />
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-48 border rounded px-3 py-2"
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            )}
          </div>

          {/* Grilla de productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const out = Number(p.stock) <= 0;
              const low = !out && Number(p.stock) < 5;
              const inCart = cart.find((c) => c.product_id === p.id);
              return (
                <div
                  key={p.id}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" && !out) addToCart(p); }}
                  className="border rounded shadow-sm p-3 outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold leading-5">{p.name}</h3>
                    <span className="text-sm">{money(p.price)}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    {out ? (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Sin stock</span>
                    ) : low ? (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Bajo stock ({p.stock})</span>
                    ) : (
                      <span className="text-xs text-gray-500">Stock: {p.stock}</span>
                    )}
                  </div>

                  {/* Stepper rápido */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      disabled={out || !inCart}
                      onClick={() => decQty(p.id)}
                      className={`px-2 py-1 rounded border ${out || !inCart ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
                      title="Quitar 1"
                    >–</button>
                    <div className="text-sm min-w-10 text-center">
                      {inCart ? inCart.quantity : 0}
                    </div>
                    <button
                      disabled={out}
                      onClick={() => addToCart(p)}
                      className={`px-2 py-1 rounded border ${out ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
                      title="Agregar 1 (Enter)"
                    >+</button>
                    <button
                      disabled={out}
                      onClick={() => addToCart(p)}
                      className={`ml-auto px-2 py-1 text-white text-sm rounded ${out ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-sm text-gray-500 border rounded p-4">
                No se encontraron productos para tu búsqueda.
              </div>
            )}
          </div>

          {/* Historial de ventas */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Ventas recientes</h2>
            {loading ? (
              <p>Cargando...</p>
            ) : sales.length === 0 ? (
              <p className="text-gray-500">No hay ventas registradas.</p>
            ) : (
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border text-left">ID</th>
                    <th className="p-2 border text-left">Fecha</th>
                    <th className="p-2 border text-right">Total</th>
                    <th className="p-2 border"></th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => (
                    <tr key={s.id}>
                      <td className="p-2 border">{s.id}</td>
                      <td className="p-2 border">{s.created_at}</td>
                      <td className="p-2 border text-right">{money(s.total)}</td>
                      <td className="p-2 border text-center">
                        <button
                          onClick={() => setSelectedSaleId(s.id)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Columna derecha: carrito sticky */}
        <aside className="md:sticky md:top-6 space-y-3">
          <div className="border rounded-lg shadow-sm p-4 bg-white">
            <h2 className="text-lg font-semibold mb-3">Carrito</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500">No hay productos en el carrito.</p>
            ) : (
              <div className="space-y-3">
                {cart.map((c) => (
                  <div key={c.product_id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">
                        {money(c.price)} ×
                        <input
                          type="number"
                          min="1"
                          value={c.quantity}
                          onChange={(e) => updateQty(c.product_id, e.target.value)}
                          className="w-14 border rounded p-0.5 mx-2 text-center"
                        />
                        = <span className="font-medium">{money(c.price * c.quantity)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => decQty(c.product_id)}
                      className="px-2 py-1 rounded border hover:bg-gray-50"
                      title="Quitar 1"
                    >–</button>
                    <button
                      onClick={() => incQty(c.product_id)}
                      className="px-2 py-1 rounded border hover:bg-gray-50"
                      title="Agregar 1"
                    >+</button>
                    <button
                      onClick={() => requestRemove(c.product_id)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-sm"
                      title="Eliminar del carrito"
                    >
                      X
                    </button>
                  </div>
                ))}

                <div className="pt-3 mt-3 border-t flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{money(totalCart)}</span>
                </div>

                <button
                  onClick={confirmSale}
                  disabled={isSaving || cart.length === 0}
                  className={`w-full mt-2 px-4 py-2 text-white rounded font-semibold ${
                    isSaving ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                  }`}
                  title="F4 para confirmar"
                >
                  {isSaving ? "Confirmando..." : "Confirmar Venta"}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Modal detalle de venta */}
      {selectedSaleId && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-xl font-bold">Detalle de venta #{selectedSaleId}</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setSelectedSaleId(null)}>✕</button>
            </div>

            <p className="text-sm text-gray-500 mb-1">
              {loadingItems ? "Cargando..." : `Fecha: ${sale?.created_at ?? "-"}`}
            </p>
            <p className="text-lg font-semibold mb-4 text-green-600">Total: {money(sale?.total)}</p>

            <div className="space-y-2">
              {(sale?.items ?? []).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-14 h-14 object-cover rounded-md cursor-pointer hover:scale-105 transition"
                      onClick={() => setSelectedImage(item.image_url)}
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium truncate">{item.product_name}</p>
                    <p className="text-sm text-gray-600">
                      {item.size ?? "-"} — {item.quantity} × {money(item.price)} = {money(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Modal imagen */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative">
            <img src={selectedImage} alt="Producto" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg" />
            <button
              className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 shadow hover:bg-gray-200"
              onClick={() => setSelectedImage(null)}
            >✕</button>
          </div>
        </div>
      )}

      {/* Modales y toasts */}
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
