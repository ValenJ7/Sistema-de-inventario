// ----------------------------------------------
// 🧾 CategoryList
// ----------------------------------------------
export default function CategoryList({ categories, setSelected, onDelete }) {
  return (
    <div className="max-w-md mx-auto mt-6">
      <table className="w-full text-sm border border-gray-200 rounded">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Descripción</th>
            <th className="p-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id} className="border-t">
              <td className="p-2">{cat.name}</td>
              <td className="p-2">{cat.description}</td>
              <td className="p-2 text-center space-x-3">
                <button onClick={() => setSelected(cat)} className="text-blue-600">Editar</button>
                <button onClick={() => onDelete(cat.id)} className="text-red-600">Eliminar</button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr><td className="p-3 text-center text-gray-500" colSpan={3}>Sin categorías</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
