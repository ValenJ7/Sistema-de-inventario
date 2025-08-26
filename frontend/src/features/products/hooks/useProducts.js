// ----------------------------------------------
// 🪝 useProducts
// ----------------------------------------------
import { useEffect, useState } from 'react';
import api from '../../../api/backend';

export default function useProducts() {
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    try {
      const res = await api.get('/products/get-products.php');
      setProducts(res.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const normalizeProduct = (data) => ({
    ...data,
    price: data.price === '' ? null : Number(data.price),
    stock: data.stock === '' ? null : Number(data.stock),
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

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/delete-product.php?id=${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar producto:', error);
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

  return { products, addProduct, deleteProduct, updateProduct };
}
