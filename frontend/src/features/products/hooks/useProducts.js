// src/features/products/hooks/useProducts.js
import { useEffect, useState } from 'react';
import api from '../../../api/backend';

/**
 * Hook de productos con filtros, paginación y orden.
 * Expone: products, total, page, limit, sort, order, filters,
 * setFilters(patch), setPage, setSort, reload, addProduct, updateProduct, deleteProduct.
 */
export default function useProducts(initialFilters = {}) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading ] = useState(false);
  const [total,    setTotal   ] = useState(0);

  const [filters, _setFilters] = useState({
    q: '',
    categoryId: null, 
    stock: 'any',     // any|in|out
    hidden: 'any',    // si luego agregás is_hidden: 0|1|any
    sort: 'created_at',
    order: 'desc',
    page: 1,
    limit: 20,
    ...initialFilters,
  });

  const setFilters = (patch) => {
    _setFilters((s) => ({ ...s, ...patch }));
  };
  const setPage = (p) => setFilters({ page: Math.max(1, Number(p) || 1) });
  const setSort = (sort, order) => setFilters({
    sort: sort || 'created_at',
    order: (order === 'asc' ? 'asc' : 'desc'),
    page: 1,
  });

  const load = async (f = filters) => {
    try {
      setLoading(true);
      const params = {
        q: f.q || undefined,
        category_id: f.categoryId ?? undefined,
        stock: f.stock || 'any',
        hidden: f.hidden || 'any',
        sort: f.sort,
        order: f.order,
        page: f.page,
        limit: f.limit,
        t: Date.now(),
      };

      const res = await api.get('admin/products/get-products.php', { params });
      const payload = res?.data;

      // Soporta varias formas de respuesta
      const items =
        Array.isArray(payload) ? payload
      : Array.isArray(payload?.items) ? payload.items
      : Array.isArray(payload?.data) ? payload.data
      : Array.isArray(payload?.data?.items) ? payload.data.items
      : [];

      const tot =
        Number(payload?.total) ||
        Number(payload?.data?.total) ||
        (Array.isArray(payload) ? items.length : 0);

      setProducts(items);
      setTotal(tot);
    } catch (e) {
      console.error('Error al cargar productos:', e);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Cargar cuando cambian filtros
  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const reload = () => load();

  // ---- CRUD que ya usás en InventoryPage/ProductForm ----
  const normalizeProduct = (data) => ({
    name: data.name?.trim() ?? '',
    price: data.price === '' || data.price == null ? 0 : Number(data.price),
    category_id:
      data.category_id === '' || data.category_id === undefined
        ? null
        : Number(data.category_id),
  });

  const addProduct = async (data) => {
    try {
      const res = await api.post(
        'admin/products/create-product.php',
        normalizeProduct(data),
        { headers: { 'Content-Type': 'application/json' } }
      );
      const id =
        res?.data?.data?.id ??
        res?.data?.id ??
        res?.data?.data?.insert_id ??
        null;
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
        'admin/products/update-product.php',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );
      await load();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`admin/products/delete-product.php?id=${id}`);
      // optimista
      setProducts((prev) => prev.filter((p) => p.id !== id));
      // y refresco real
      await load();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  return {
    products, loading, total,
    page: filters.page, limit: filters.limit,
    sort: filters.sort, order: filters.order,
    filters, setFilters,
    setPage, setSort,
    reload,
    addProduct, updateProduct, deleteProduct,
  };
}
