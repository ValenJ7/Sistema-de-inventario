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

export default function ProductList({ products, onEdit, onDelete, reloadToken }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Producto</th>
            <th className="px-4 py-2 text-left">Categoría</th>
            <th className="px-4 py-2 text-left">Precio</th>
            <th className="px-4 py-2 text-left">Talles Disponibles</th>
            <th className="px-4 py-2 text-center">Stock Total</th>
            <th className="px-4 py-2 text-center">Estado</th>
            <th className="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((p) => {
            const src = buildImageSrc(p, reloadToken);
            return (
              <tr key={p.id} className="hover:bg-gray-50">
                {/* Producto */}
                <td className="px-4 py-3 flex items-center gap-3">
                  {src ? (
                    <img
                      src={src}
                      alt={p.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                      —
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-500">{p.slug}</div>
                  </div>
                </td>

                {/* Categoría */}
                <td className="px-4 py-3">{p.category_name || "-"}</td>

                {/* Precio */}
                <td className="px-4 py-3">${p.price}</td>

                {/* Talles disponibles */}
                <td className="px-4 py-3 space-x-2">
                  {Array.isArray(p.variants_summary) && p.variants_summary.length > 0 ? (
                    p.variants_summary.map((v, i) => (
                      <span
                        key={i}
                        className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                      >
                        {v.label}: {v.stock}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                {/* Stock total */}
                <td className="px-4 py-3 text-center">{p.stock_total ?? 0}</td>

                {/* Estado */}
                <td className="px-4 py-3 text-center">
                  <StockBadge state={p.stock_total > 0 ? "in" : "out"} />
                </td>

                {/* Acciones */}
                <td className="px-4 py-3 text-center space-x-2">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
