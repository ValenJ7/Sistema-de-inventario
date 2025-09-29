import { money } from "../../../utils/money";




// components/ProductList.jsx
const BACKEND_BASE = "http://localhost/SistemaDeInventario/backend";

function buildImageSrc(p, reloadToken) {
  const path = p?.image_path ?? p?.main_image ?? null;
  if (!path) return null;
  const url = /^https?:\/\//i.test(path) ? path : `${BACKEND_BASE}${path}`;
  return `${url}?t=${reloadToken || ""}`;
}

function StockBadge({ state }) {
  const isIn = state === "in";
  return (
    <span
      className={`px-3 py-1 text-sm rounded-full font-medium ${
        isIn ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {isIn ? "Con stock" : "Sin stock"}
    </span>
  );
}

// Normaliza variantes a [{label, stock?}] y filtra vacíos
function normalizeVariants(p) {
  const raw =
    (Array.isArray(p?.variants_detail) && p.variants_detail) ||
    (Array.isArray(p?.variants) && p.variants) ||
    (Array.isArray(p?.variants_summary) && p.variants_summary) ||
    [];

  return raw
    .map((v) => {
      if (typeof v === "string") {
        const [label, qty] = v.split(":").map((s) => s?.trim());
        return { label: label || "", stock: qty !== undefined ? Number(qty) : undefined };
      }
      // objeto
      return { label: (v?.label || "").trim(), stock: v?.stock };
    })
    .filter((v) => v.label.length > 0);
}

export default function ProductList({
  products,
  total = 0,
  page = 1,
  limit = 20,
  sort = "created_at",
  order = "desc",
  onEdit,
  onDelete,
  onPageChange,
  onSortChange,
  reloadToken,
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));

  const thSort = (key, label) => {
    const active = sort === key;
    const nextOrder = active ? (order === "asc" ? "desc" : "asc") : "asc";
    return (
      <th
        className="px-4 py-2 text-left cursor-pointer select-none"
        onClick={() => onSortChange && onSortChange(key, nextOrder)}
        title={`Ordenar por ${label}`}
      >
        {label} {active ? (order === "asc" ? "↑" : "↓") : ""}
      </th>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {thSort("name", "Producto")}
            <th className="px-4 py-2 text-left">Categoría</th>
            {thSort("price", "Precio")}
            <th className="px-4 py-2 text-left">Talles Disponibles</th>
            {thSort("stock_total", "Stock Total")}
            <th className="px-4 py-2 text-center">Estado</th>
            <th className="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                No hay productos para mostrar.
              </td>
            </tr>
          )}

          {products.map((p) => {
            const src = buildImageSrc(p, reloadToken);
            const variants = normalizeVariants(p);

            return (
              <tr key={p.id} className="hover:bg-gray-50">
                {/* Producto */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {src ? (
                      <img src={src} alt={p.name} className="h-12 w-12 object-cover rounded" />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        —
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-gray-500">{p.slug}</div>
                    </div>
                  </div>
                </td>

                {/* Categoría */}
                <td className="px-4 py-3">{p.category_name || "-"}</td>

                {/* Precio */}
                <td className="px-4 py-3">{money(p.price)}</td>

                {/* Talles disponibles */}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {variants.length > 0 ? (
                      variants.map((v, i) => (
                        <span
                          key={i}
                          className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                        >
                          {v.label}
                          {typeof v.stock === "number" ? `: ${v.stock}` : ""}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                </td>

                {/* Stock total */}
                <td className="px-4 py-3 text-center">{p.stock_total ?? 0}</td>

                {/* Estado */}
                <td className="px-4 py-3 text-center">
                  <StockBadge state={p.stock_total > 0 ? "in" : "out"} />
                </td>

                {/* Acciones */}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(p)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(p.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="flex items-center justify-between p-3">
        <div className="text-sm text-gray-600">
          {total} resultados • Página {page} de {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => onPageChange && onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Anterior
          </button>
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => onPageChange && onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
