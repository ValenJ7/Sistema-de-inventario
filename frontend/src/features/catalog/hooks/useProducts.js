import { useState, useEffect } from "react";
import api from "../../../api/backend"; // instancia axios

// 🔹 Hook para listado de productos (con paginación y "mostrar más")
export function useProducts(initialParams = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const size = initialParams.size || 8;
  const filters = { ...initialParams };

  async function fetchProducts(pageToLoad = 1, append = false) {
    try {
      setLoading(true);
      const res = await api.get("/catalog/products.php", {
        params: { ...filters, page: pageToLoad, size },
      });

      const data = Array.isArray(res.data) ? res.data : res.data.data || [];

      if (append) {
        setProducts((prev) => [...prev, ...data]);
      } else {
        setProducts(data);
      }

      setHasMore(data.length === size);
    } catch (err) {
      console.error("Error cargando productos", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
    fetchProducts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  }

  return { products, loading, hasMore, loadMore };
}

// 🔹 Hook para un único producto por slug
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
