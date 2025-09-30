// features/reports/components/SalesHistory.jsx
import { money } from "../../../utils/money";

function formatDateTime(isoOrDt) {
  const d = new Date(isoOrDt.replace(" ", "T"));
  return d.toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" });
}

export default function SalesHistory({ rows = [], totalRows = 0, page = 1, pageSize = 25, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-medium">Historial de ventas</div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-2">Fecha</th>
            <th className="py-2 w-24">Items</th>
            <th className="py-2 w-32">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="py-2">{formatDateTime(r.created_at)}</td>
              <td className="py-2">{r.items_count}</td>
              <td className="py-2">{money(r.total)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center text-gray-500">No hay ventas en el rango</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Página {page} de {totalPages} — {totalRows} ventas
        </div>
        <div className="space-x-2">
          <button
            className="rounded-lg border px-3 py-1.5 disabled:opacity-50"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Anterior
          </button>
          <button
            className="rounded-lg border px-3 py-1.5 disabled:opacity-50"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
