// ----------------------------------------------
// 🧾 ProductList
// ----------------------------------------------
export default function ProductList({ products, setSelectedProduct, onDeleteProduct }) {
  const handleDelete = async (id) => {
    try { await onDeleteProduct(id); }
    catch (error) { console.error('Error al eliminar producto:', error); }
  };

  return (
    <div className="p-4">
      <div className="flex justify-center mt-6">
        <div className="w-full max-w-5xl">
          <table className="w-full text-sm border border-gray-300 rounded overflow-hidden shadow">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3 border-b border-gray-300">Nombre</th>
                <th className="p-3 border-b border-gray-300">Categoría</th>
                <th className="p-3 border-b border-gray-300">Talle</th>
                <th className="p-3 border-b border-gray-300 text-right">Precio</th>
                <th className="p-3 border-b border-gray-300 text-right">Stock</th>
                <th className="p-3 border-b border-gray-300 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(products) && products.map((producto, index) => (
                <tr key={producto.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                  <td className="p-3 border-b border-gray-200">{producto.name}</td>
                  <td className="p-3 border-b border-gray-200">{producto.category_name || '—'}</td>
                  <td className="p-3 border-b border-gray-200">{producto.size}</td>
                  <td className="p-3 border-b border-gray-200 text-right">${Number(producto.price ?? 0).toFixed(2)}</td>
                  <td className="p-3 border-b border-gray-200 text-right">{producto.stock}</td>
                  <td className="p-3 border-b border-gray-200 text-center space-x-2">
                    <button onClick={() => setSelectedProduct(producto)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => handleDelete(producto.id)} className="text-red-600 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
              {Array.isArray(products) && products.length === 0 && (
                <tr><td className="p-3 text-center text-gray-500" colSpan={6}>Sin productos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
