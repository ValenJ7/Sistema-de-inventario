// ----------------------------------------------
// 🪝 useProducts — Paso 1: consumo robusto del backend
// ----------------------------------------------
import { useEffect, useState } from 'react';
import api from '../../../api/backend';

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Gracias al interceptor de api, res.data ya es un ARRAY cuando el backend devuelve {success,data:[...]}
      const res = await api.get(`/products/get-products.php?t=${Date.now()}`);
      const items = Array.isArray(res.data) ? res.data : [];
      setProducts(items);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  // Normalización mínima para tipos numéricos y nullables
  const normalizeProduct = (data) => ({
    ...data,
    price: data.price === '' || data.price === null ? null : Number(data.price),
    stock: data.stock === '' || data.stock === null ? null : Number(data.stock),
    category_id:
      data.category_id === '' || data.category_id === undefined
        ? null
        : Number(data.category_id),
  });

  const addProduct = async (data) => {
    try {
      await api.post('/products/create-product.php', normalizeProduct(data));
      await loadProducts();
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  };

  const updateProduct = async (data) => {
    try {
      const payload = normalizeProduct(data);
      if (!payload.id) throw new Error('Falta id');
      await api.post('/products/update-product.php', payload);
      await loadProducts();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/delete-product.php?id=${id}`);
      // Optimista: si fallara, el reload siguiente lo corrige
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  return { products, loading, addProduct, updateProduct, deleteProduct, reload: loadProducts };
}
