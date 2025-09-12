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

  return { products, loading, setProducts };
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
