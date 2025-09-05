// ----------------------------------------------
// 🧾 ProductList.jsx — con columna de imagen
// ----------------------------------------------
export default function ProductList({ products, setSelectedProduct, onDeleteProduct }) {
  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Img</th>
            <th className="px-4 py-2 border">ID</th>
            <th className="px-4 py-2 border">Nombre</th>
            <th className="px-4 py-2 border">Slug</th>
            <th className="px-4 py-2 border">Talle</th>
            <th className="px-4 py-2 border">Precio</th>
            <th className="px-4 py-2 border">Stock</th>
            <th className="px-4 py-2 border">Categoría</th>
            <th className="px-4 py-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="text-center">
              <td className="px-4 py-2 border">
                {p.main_image ? (
                  <img
                    src={`http://localhost/SistemaDeInventario/backend${p.main_image}`}
                    alt={p.name}
                    className="h-12 w-12 object-cover rounded mx-auto"
                  />
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-2 border">{p.id}</td>
              <td className="px-4 py-2 border">{p.name}</td>
              <td className="px-4 py-2 border">
                <code className="px-2 py-1 bg-gray-100 rounded">{p.slug}</code>
              </td>
              <td className="px-4 py-2 border">{p.size}</td>
              <td className="px-4 py-2 border">${p.price}</td>
              <td className="px-4 py-2 border">{p.stock}</td>
              <td className="px-4 py-2 border">{p.category_name || '-'}</td>
              <td className="px-4 py-2 border space-x-2">
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDeleteProduct(p.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
