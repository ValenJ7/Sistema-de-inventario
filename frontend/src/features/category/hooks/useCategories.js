// ----------------------------------------------
// 🪝 useCategories
// ----------------------------------------------
import { useEffect, useState } from 'react';
import axios from 'axios';

const BASE = 'http://localhost/SistemaDeInventario/backend/categories';

export default function useCategories() {
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    try {
      const url = `${BASE}/get-categories.php?t=${Date.now()}`;
      const { data } = await axios.get(url);
      setCategories(data);
    } catch (err) {
      console.error('Error cargando categorías:', err);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const addCategory = async (payload) => {
    try { await axios.post(`${BASE}/create-category.php`, payload); await loadCategories(); }
    catch (err) { console.error('Error creando categoría:', err); }
  };

  const updateCategory = async (payload) => {
    try { await axios.put(`${BASE}/update-category.php`, payload); await loadCategories(); }
    catch (err) { console.error('Error actualizando categoría:', err); }
  };

  const deleteCategory = async (id) => {
    try { await axios.delete(`${BASE}/delete-category.php?id=${id}`); setCategories(prev => prev.filter(c => c.id !== id)); }
    catch (err) { console.error('Error eliminando categoría:', err); }
  };

  return { categories, addCategory, updateCategory, deleteCategory };
}
