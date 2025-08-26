// ----------------------------------------------
// 🧾 CategoryForm
// ----------------------------------------------
import { useEffect, useState } from 'react';

export default function CategoryForm({ selected, setSelected, onAddCategory, onUpdateCategory }) {
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (selected) setForm({ name: selected.name || '', description: selected.description || '' });
    else setForm({ name: '', description: '' });
  }, [selected]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selected) await onUpdateCategory({ id: selected.id, ...form });
    else await onAddCategory(form);
    setForm({ name: '', description: '' });
    setSelected(null);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
      <input className="border p-2 rounded w-full" name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required />
      <input className="border p-2 rounded w-full" name="description" placeholder="Descripción (opcional)" value={form.description} onChange={handleChange} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">{selected ? 'Actualizar' : 'Agregar'}</button>
    </form>
  );
}
