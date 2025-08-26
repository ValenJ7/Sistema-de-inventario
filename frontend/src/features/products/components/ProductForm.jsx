// ----------------------------------------------
// 🧾 ProductForm
// ----------------------------------------------
import { useEffect, useState } from 'react';
import api from '../../../api/backend';

export default function ProductForm({ selectedProduct, setSelectedProduct, onAddProduct, onUpdateProduct }) {
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    size: '',
    price: '',
    stock: '',
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories/get-categories.php')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Error cargando categorías:', err));
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setForm({
        ...selectedProduct,
        category_id: selectedProduct.category_id || ''
      });
    } else {
      setForm({ name: '', category_id: '', size: '', price: '', stock: '' });
    }
  }, [selectedProduct]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedProduct) await onUpdateProduct(form);
    else await onAddProduct(form);
    setForm({ name: '', category_id: '', size: '', price: '', stock: '' });
    setSelectedProduct(null);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 max-w-md mx-auto space-y-3">
      <input className="border p-2 rounded w-full" type="text" name="name" placeholder="Nombre"
             value={form.name} onChange={handleChange} required />

      <select name="category_id" className="border p-2 rounded w-full"
              value={form.category_id} onChange={handleChange} required>
        <option value="">Seleccioná una categoría</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <input className="border p-2 rounded w-full" type="text" name="size" placeholder="Talle"
             value={form.size} onChange={handleChange} required />
      <input className="border p-2 rounded w-full" type="number" name="price" placeholder="Precio"
             value={form.price} onChange={handleChange} required />
      <input className="border p-2 rounded w-full" type="number" name="stock" placeholder="Stock"
             value={form.stock} onChange={handleChange} required />

      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full font-semibold" type="submit">
        {selectedProduct ? 'Actualizar' : 'Agregar'}
      </button>
    </form>
  );
}
