    // features/reports/components/SaleDetailModal.jsx
import { money } from "../../../utils/money";

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(String(iso).replace(" ", "T"));
  return d.toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" });
}

export default function SaleDetailModal({ open, sale, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-4 top-10 mx-auto max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <div className="text-sm text-gray-500">Venta #{sale?.id}</div>
            <div className="text-base font-semibold">{formatDateTime(sale?.created_at)}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
            aria-label="Cerrar"
          >
            Cerrar
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2">Producto</th>
                <th className="py-2 w-16 text-right">Cant.</th>
                <th className="py-2 w-28 text-right">Precio</th>
                <th className="py-2 w-28 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(sale?.items || []).map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="py-2">
                    <div className="flex items-center gap-3">
                      {it.image_url ? (
                        <img src={it.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-100" />
                      )}
                      <div>
                        <div className="font-medium">{it.product_name}</div>
                        {it.size ? (
                          <div className="text-xs text-gray-500">Talle: {it.size}</div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="py-2 text-right">{it.quantity}</td>
                  <td className="py-2 text-right">{money(it.price)}</td>
                  <td className="py-2 text-right">{money(it.subtotal)}</td>
                </tr>
              ))}
              {(!sale?.items || sale.items.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    Sin ítems para esta venta
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-6 border-t p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-xl font-semibold">{money(sale?.total || 0)}</div>
        </div>
      </div>
    </div>
  );
}
