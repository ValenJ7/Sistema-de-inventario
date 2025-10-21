import { useMemo, useState, useEffect } from "react";
import useCart from "../useCart";

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { items, subtotal, inc, dec, remove } = useCart();
  const [justAdded, setJustAdded] = useState(null);

  const list = useMemo(() => Object.values(items), [items]);

  // Detectar producto recién agregado
  useEffect(() => {
    if (list.length > 0) {
      const last = list[list.length - 1];
      setJustAdded(last.name);
      const t = setTimeout(() => setJustAdded(null), 3000);
      return () => clearTimeout(t);
    }
  }, [list.length]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Fondo */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`absolute top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mi carrito</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-black">
            ✕
          </button>
        </header>

        {/* Alerta de agregado */}
        {justAdded && (
          <div className="bg-green-100 text-green-800 px-4 py-2 text-sm border-b border-green-200">
            Has agregado <strong>{justAdded}</strong> al carrito de compras.
          </div>
        )}

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4">
          {list.length === 0 ? (
            <p className="text-gray-500 text-center mt-8">
              Tu carrito está vacío.
            </p>
          ) : (
            list.map((it) => (
              <article
                key={`${it.id}:${it.variant ?? "-"}`}
                className="flex items-center gap-3 border-b py-3"
              >
                <img
                  src={it.image}
                  alt={it.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{it.name}</p>
                  {it.variant && (
                    <p className="text-sm text-gray-500">
                      Talle: {it.variant}
                    </p>
                  )}
                  <p className="text-sm text-gray-700">
                    ${Number(it.price).toLocaleString("es-AR")}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => dec(it.id, it.variant)}
                      className="border px-2 py-1 rounded hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="min-w-[24px] text-center">{it.qty}</span>
                    <button
                      onClick={() => inc(it.id, it.variant)}
                      className="border px-2 py-1 rounded hover:bg-gray-100"
                    >
                      +
                    </button>
                    <button
                      onClick={() => remove(it.id, it.variant)}
                      className="ml-auto text-sm text-gray-500 hover:text-red-600"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Subtotal y acción */}
        <footer className="p-4 border-t">
          <div className="flex justify-between mb-3">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-semibold">
              ${Number(subtotal).toLocaleString("es-AR")}
            </span>
          </div>

          {list.length > 0 && (
            <>
              <p className="text-xs text-gray-500 mb-3">
                Los descuentos e impuestos se aplicarán en el checkout.
              </p>
              <button
                onClick={onCheckout}
                className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-900 transition"
              >
                Completar compra
              </button>
            </>
          )}
        </footer>
      </aside>
    </div>
  );
}
