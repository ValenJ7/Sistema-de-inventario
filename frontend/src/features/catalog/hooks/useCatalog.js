import { useState, useEffect } from "react";
import api from "../../../api/backend"; // instancia axios

// 🔹 Hook para traer listado de productos con filtros
export function useProducts(params = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get("/catalog/products.php", { params });
        console.log("👉 respuesta productos:", res.data);
        setProducts(Array.isArray(res.data) ? res.data : res.data.data || []);
      } catch (err) {
        console.error("Error cargando productos", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [JSON.stringify(params)]);

  return { products, loading };
}

// 🔹 Hook para traer detalle de un producto por slug
export function useProduct(slug) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    async function fetchProduct() {
      try {
        const res = await api.get("/catalog/products.php", { params: { slug } });
        setProduct(res.data.data || null);
      } catch (err) {
        console.error("Error cargando producto", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  return { product, loading };
}

// 🔹 Hook para traer todas las categorías
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get("/catalog/categories.php");
        console.log("👉 respuesta categorías:", res.data);
        setCategories(Array.isArray(res.data) ? res.data : res.data.data || []);
      } catch (err) {
        console.error("Error cargando categorías", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return { categories, loading };
}
