// ----------------------------------------------
// 🧾 CategoryList (defensivo)
// ----------------------------------------------
export default function CategoryList({ categories, setSelected, onDelete }) {
  const list = Array.isArray(categories) ? categories : [];

  return (
    <div className="max-w-md mx-auto mt-6">
      <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Descripción</th>
            <th className="p-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.map((cat, i) => (
            <tr key={cat.id ?? i} className={i % 2 ? 'bg-gray-50' : 'bg-white'}>
              <td className="p-2 border-t">{cat.name}</td>
              <td className="p-2 border-t">{cat.description || '—'}</td>
              <td className="p-2 border-t text-center space-x-3">
                <button onClick={() => setSelected?.(cat)} className="text-blue-600 hover:underline">Editar</button>
                <button onClick={() => onDelete?.(cat.id)} className="text-red-600 hover:underline">Eliminar</button>
              </td>
            </tr>
          ))}

          {list.length === 0 && (
            <tr>
              <td className="p-3 text-center text-gray-500" colSpan={3}>Sin categorías</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
