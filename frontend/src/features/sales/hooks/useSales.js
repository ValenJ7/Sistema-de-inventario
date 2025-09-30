// features/sales/hooks/useSales.js
import { useState } from "react";
import api from "../../../api/backend";

export default function useSales() {
  const [loading, setLoading] = useState(false);

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

  return { loading, createSale };
}
