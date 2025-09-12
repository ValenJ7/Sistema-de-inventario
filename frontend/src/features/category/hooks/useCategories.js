// ----------------------------------------------
// 🪝 useCategories — Paso 1: consumo robusto del backend
// ----------------------------------------------
import { useEffect, useState } from 'react';
import api from '../../../api/backend';

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/categories/get-categories.php?t=${Date.now()}`);
      // Con el interceptor, res.data ya es ARRAY si backend envía {success,data:[...]}
      const items = Array.isArray(res.data) ? res.data : [];
      setCategories(items);
    } catch (err) {
      console.error('Error cargando categorías:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const addCategory = async (payload) => {
    try {
      await api.post('/admin/categories/create-category.php', payload);
      await loadCategories();
    } catch (err) {
      console.error('Error creando categoría:', err);
    }
  };

  const updateCategory = async (payload) => {
    try {
      await api.put('/admin/categories/update-category.php', payload);
      await loadCategories();
    } catch (err) {
      console.error('Error actualizando categoría:', err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/admin/categories/delete-category.php?id=${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error eliminando categoría:', err);
    }
  };

  return { categories, loading, addCategory, updateCategory, deleteCategory, reload: loadCategories };
}
