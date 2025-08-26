// ----------------------------------------------
// 🧾 ProductForm (con id garantizado en updates)
// ----------------------------------------------
import { useEffect, useState } from 'react';
import api from '../../../api/backend';

export default function ProductForm({
  selectedProduct,
  setSelectedProduct,
  onAddProduct,
  onUpdateProduct,
}) {
  // ✅ Incluimos id en el estado del form
  const [form, setForm] = useState({
    id: null,
    name: '',
    category_id: '',
    size: '',
    price: '',
    stock: '',
  });

  const [categories, setCategories] = useState([]);

  // Cargar categorías en forma segura (usa interceptor de api)
  useEffect(() => {
    api
      .get('/categories/get-categories.php')
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : [];
        setCategories(items);
      })
      .catch((err) => console.error('Error cargando categorías:', err));
  }, []);

  // Cuando seleccionás un producto para editar, llenamos el form (incluye id)
  useEffect(() => {
    if (selectedProduct) {
      setForm({
        id: selectedProduct.id ?? null,
        name: selectedProduct.name ?? '',
        category_id:
          selectedProduct.category_id === null ||
          selectedProduct.category_id === undefined
            ? ''
            : String(selectedProduct.category_id),
        size: selectedProduct.size ?? '',
        price: selectedProduct.price ?? '',
        stock: selectedProduct.stock ?? '',
      });
    } else {
      // Modo crear
      setForm({
        id: null,
        name: '',
        category_id: '',
        size: '',
        price: '',
        stock: '',
      });
    }
  }, [selectedProduct]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Si estamos editando, garantizamos que viaje el id
    if (selectedProduct) {
      await onUpdateProduct({
        ...form,
        id: form.id ?? selectedProduct.id, // fallback por las dudas
      });
    } else {
      await onAddProduct(form);
    }

    // Reset y salir del modo edición
    setForm({
      id: null,
      name: '',
      category_id: '',
      size: '',
      price: '',
      stock: '',
    });
    setSelectedProduct(null);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 max-w-md mx-auto space-y-3">
      {/* (oculto) mantenemos id en el form para no perderlo */}
      <input type="hidden" name="id" value={form.id ?? ''} readOnly />

      <input
        className="border p-2 rounded w-full"
        type="text"
        name="name"
        placeholder="Nombre"
        value={form.name}
        onChange={handleChange}
        required
      />

      <select
        name="category_id"
        className="border p-2 rounded w-full"
        value={form.category_id}
        onChange={handleChange}
      >
        <option value="">Seleccioná una categoría</option>
        {Array.isArray(categories) &&
          categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
      </select>

      <input
        className="border p-2 rounded w-full"
        type="text"
        name="size"
        placeholder="Talle"
        value={form.size}
        onChange={handleChange}
        required
      />
      <input
        className="border p-2 rounded w-full"
        type="number"
        name="price"
        placeholder="Precio"
        value={form.price}
        onChange={handleChange}
        required
      />
      <input
        className="border p-2 rounded w-full"
        type="number"
        name="stock"
        placeholder="Stock"
        value={form.stock}
        onChange={handleChange}
        required
      />

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full font-semibold"
        type="submit"
      >
        {selectedProduct ? 'Actualizar' : 'Agregar'}
      </button>
    </form>
  );
}
