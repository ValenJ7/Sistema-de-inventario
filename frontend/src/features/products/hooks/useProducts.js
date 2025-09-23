// hooks/useProducts.js
import { useEffect, useState } from 'react';
import api from '../../../api/backend';

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('admin/products/get-products.php', { params: { t: Date.now() } });

      // Soporta [ ... ] o { success, data:[ ... ] }
      const payload = res?.data;
      const items = Array.isArray(payload) ? payload
                  : Array.isArray(payload?.data) ? payload.data
                  : [];
      setProducts(items);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  // Solo los campos que realmente usa el backend ahora
  const normalizeProduct = (data) => ({
    name: data.name?.trim() ?? '',
    price: data.price === '' || data.price == null ? 0 : Number(data.price),
    category_id:
      data.category_id === '' || data.category_id === undefined
        ? null
        : Number(data.category_id),
    // size/stock ya no se envían: se manejan por variantes
  });

  // Crear: devuelve id
  const addProduct = async (data) => {
    try {
      const res = await api.post(
        'admin/products/create-product.php',   // ← sin "/" inicial
        normalizeProduct(data),
        { headers: { 'Content-Type': 'application/json' } }
      );
      const id = res?.data?.data?.id ?? res?.data?.id ?? null;
      return id;
    } catch (error) {
      console.error('Error al agregar producto:', error);
      return null;
    }
  };

  const updateProduct = async (data) => {
    try {
      const payload = { id: Number(data.id), ...normalizeProduct(data) };
      if (!payload.id) throw new Error('Falta id');
      await api.post(
        'admin/products/update-product.php',   // ← sin "/" inicial
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      await loadProducts();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`admin/products/delete-product.php?id=${id}`); // ← sin "/" inicial
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  return { products, loading, addProduct, updateProduct, deleteProduct, reload: loadProducts };
}
