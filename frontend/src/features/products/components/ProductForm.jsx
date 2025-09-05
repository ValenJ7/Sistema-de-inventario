// ----------------------------------------------
// 🧾 ProductForm.jsx — con soporte de imagen y recarga final
// ----------------------------------------------
import { useEffect, useState } from 'react';
import api, { uploadProductImage } from '../../../api/backend';

export default function ProductForm({
  selectedProduct,
  setSelectedProduct,
  onAddProduct,
  onUpdateProduct,
  reload,                 // 👈 recibimos reload
}) {
  const [form, setForm] = useState({
    id: null,
    name: '',
    category_id: '',
    size: '',
    price: '',
    stock: '',
  });

  const [categories, setCategories] = useState([]);

  // 🖼️ Estado para imagen
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Cargar categorías
  useEffect(() => {
    api
      .get('/categories/get-categories.php')
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : [];
        setCategories(items);
      })
      .catch((err) => console.error('Error cargando categorías:', err));
  }, []);

  // Si seleccionás un producto para editar, llenamos form
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
      setPreview(
        selectedProduct.main_image
          ? `http://localhost/SistemaDeInventario/backend${selectedProduct.main_image}`
          : null
      );
    } else {
      setForm({
        id: null,
        name: '',
        category_id: '',
        size: '',
        price: '',
        stock: '',
      });
      setPreview(null);
      setFile(null);
    }
  }, [selectedProduct]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let productId = selectedProduct?.id ?? null;

    try {
      if (selectedProduct) {
        // UPDATE
        await onUpdateProduct({ ...form, id: productId ?? form.id });
        productId = productId ?? form.id;
      } else {
        // CREATE — obtener id del producto recién creado (sin recargar aún)
        productId = await onAddProduct(form);
      }

      // Subir imagen si hay archivo y tenemos id
      if (file && productId) {
        try {
          await uploadProductImage(productId, file);
        } catch (err) {
          console.error('Error subiendo imagen:', err);
        }
      }

      // ✅ Recargar UNA sola vez al final, para traer main_image
      if (typeof reload === 'function') {
        await reload();
      }
    } catch (err) {
      console.error('Error en submit:', err);
    }

    // Reset
    setForm({
      id: null,
      name: '',
      category_id: '',
      size: '',
      price: '',
      stock: '',
    });
    setSelectedProduct(null);
    setFile(null);
    setPreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 max-w-md mx-auto space-y-3">
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

      {/* 📷 Input file */}
      <div className="space-y-2">
        <label className="block font-medium">
          Imagen principal (jpg/png/webp, máx 5MB)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={onPickFile}
          className="w-full"
        />
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="h-24 w-24 object-cover rounded border"
          />
        )}
      </div>

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full font-semibold"
        type="submit"
      >
        {selectedProduct ? 'Actualizar' : 'Agregar'}
      </button>
    </form>
  );
}
