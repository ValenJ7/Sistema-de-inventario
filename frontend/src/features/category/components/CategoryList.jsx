export default function CategoryList({ categories, setSelected, onDelete }) {
  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">ID</th>
            <th className="px-4 py-2 border">Nombre</th>
            <th className="px-4 py-2 border">Slug</th>{/* 👈 nuevo */}
            <th className="px-4 py-2 border">Descripción</th>
            <th className="px-4 py-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(c => (
            <tr key={c.id} className="text-center">
              <td className="px-4 py-2 border">{c.id}</td>
              <td className="px-4 py-2 border">{c.name}</td>
              <td className="px-4 py-2 border">
                <code className="px-2 py-1 bg-gray-100 rounded">{c.slug}</code>
              </td>
              <td className="px-4 py-2 border">{c.description || '-'}</td>
              <td className="px-4 py-2 border space-x-2">
                <button onClick={() => setSelected(c)} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">Editar</button>
                <button onClick={() => onDelete(c.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
