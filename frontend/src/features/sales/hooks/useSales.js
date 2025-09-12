// ----------------------------------------------
// 🪝 useSales — manejo de ventas (POS)
// ----------------------------------------------
import { useState } from "react";
import api from "../../../api/backend";

export default function useSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Registrar una venta
  const createSale = async (items) => {
    try {
      setLoading(true);
      const res = await api.post("/admin/sales/create.php", { items });
      return res.data; // { success, data: { sale_id, total, items } }
    } catch (err) {
      console.error("Error creando venta:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Listar todas las ventas
  const getSales = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/sales/get-all.php");
      const data = Array.isArray(res.data) ? res.data : [];
      setSales(data);
      return data;
    } catch (err) {
      console.error("Error cargando ventas:", err);
      setSales([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Obtener ítems de una venta
  const getSaleItems = async (saleId) => {
    try {
      const res = await api.get(`/admin/sales/get-items.php?sale_id=${saleId}`);
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error("Error cargando ítems de venta:", err);
      return [];
    }
  };

  return {
    sales,
    loading,
    createSale,
    getSales,
    getSaleItems,
  };
}
