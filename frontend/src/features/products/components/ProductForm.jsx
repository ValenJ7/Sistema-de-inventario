// components/ProductForm.jsx
import { useEffect, useState } from 'react';
import api, { uploadProductImage } from '../../../api/backend';
import ImagePickerPro from './ui/ImagePickerPro';
import useProductImages from "../hooks/useProductImages";
import ProductImageGallery from "./ui/ProductImageGallery";


const BACKEND_BASE = 'http://localhost/SistemaDeInventario/backend';

export default function ProductForm({
  selectedProduct,
  setSelectedProduct,
  onAddProduct,
  onUpdateProduct,
  reload,
}) {
  const [form, setForm] = useState({
    id: null, name: '', category_id: '', size: '', price: '', stock: '',
  });

  const [categories, setCategories] = useState([]);

  // Imagen
  const [file, setFile] = useState(null);           // nuevo archivo
  const [preview, setPreview] = useState(null);     // URL.createObjectURL del nuevo
  const [currentImage, setCurrentImage] = useState(null); // imagen actual (DB)
  const { images ,deleteImage, setMainImage, reorderImages } = useProductImages(form.id);

  // Cargar categorías
  useEffect(() => {
    api.get('/categories/get-categories.php')
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error('Error cargando categorías:', err));
  }, []);

  // Al seleccionar producto para editar
  useEffect(() => {
    if (selectedProduct) {
      setForm({
        id: selectedProduct.id ?? null,
        name: selectedProduct.name ?? '',
        category_id: selectedProduct.category_id == null ? '' : String(selectedProduct.category_id),
        size: selectedProduct.size ?? '',
        price: selectedProduct.price ?? '',
        stock: selectedProduct.stock ?? '',
      });

      const path = selectedProduct.image_path ?? selectedProduct.main_image ?? null;
      setCurrentImage(path ? `${BACKEND_BASE}${path}` : null);

      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setFile(null);
    } else {
      setForm({ id:null, name:'', category_id:'', size:'', price:'', stock:'' });
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setFile(null);
      setCurrentImage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);

  // liberar memoria si cambia preview o al desmontar
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // recibe File|null del ImagePicker
  const handlePick = (file) => {
  // liberar preview anterior
  if (preview) URL.revokeObjectURL(preview);
  if (!file) { setFile(null); setPreview(null); return; }

  const url = URL.createObjectURL(file);
  setFile(file);
  setPreview(url);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    let productId = selectedProduct?.id ?? null;

    try {
      if (selectedProduct) {
        await onUpdateProduct({ ...form, id: productId ?? form.id });
        productId = productId ?? form.id;
      } else {
        productId = await onAddProduct(form); // debe devolver id
      }

      if (file && productId) {
        const r = await uploadProductImage(productId, file);
        if (!r?.success) console.error('Error subiendo imagen:', r?.error);
      }

      if (typeof reload === 'function') await reload(Date.now());
    } catch (err) {
      console.error('Error en submit:', err);
    }

    if (preview) URL.revokeObjectURL(preview);
    setForm({ id:null, name:'', category_id:'', size:'', price:'', stock:'' });
    setSelectedProduct(null);
    setFile(null);
    setPreview(null);
    setCurrentImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 max-w-md mx-auto space-y-3">
      <input type="hidden" name="id" value={form.id ?? ''} readOnly />

      <input className="border p-2 rounded w-full" type="text" name="name" placeholder="Nombre"
             value={form.name} onChange={handleChange} required />

      <select name="category_id" className="border p-2 rounded w-full"
              value={form.category_id} onChange={handleChange}>
        <option value="">Seleccioná una categoría</option>
        {categories.map((c) => (
          <option key={c.id} value={String(c.id)}>{c.name}</option>
        ))}
      </select>

      <input className="border p-2 rounded w-full" type="text" name="size" placeholder="Talle"
             value={form.size} onChange={handleChange} required />
      <input className="border p-2 rounded w-full" type="number" name="price" placeholder="Precio"
             value={form.price} onChange={handleChange} required />
      <input className="border p-2 rounded w-full" type="number" name="stock" placeholder="Stock"
             value={form.stock} onChange={handleChange} required />

      {/* ⬇️ Selector estilado */}
      <ImagePickerPro
      label="Imagen principal"
      value={preview || currentImage || null}
      onChangeFile={(file) => {
        if (preview) URL.revokeObjectURL(preview);
        if (!file) { setFile(null); setPreview(null); return; }
        const url = URL.createObjectURL(file);
        setFile(file);
        setPreview(url);
      }}
      />
      
      {form.id && (
        <ProductImageGallery
          images={images}
          onDelete={deleteImage}
          onSetMain={setMainImage}
          onReorder={reorderImages}
        />
      )}

      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full font-semibold"
        type="submit"
      >
        {selectedProduct ? 'Actualizar' : 'Agregar'}
      </button>
    </form>
  );
}
