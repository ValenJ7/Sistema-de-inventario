import { useState, useEffect } from "react";
import api from "../../../api/backend"; // instancia axios

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
