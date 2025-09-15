import { useEffect, useState } from "react";
import api from "../../../api/backend"; // tu instancia axios

export default function useSaleItems(saleId) {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!saleId) return;

    const fetchSaleItems = async () => {
      try {
        setLoading(true);
        setError(null);

        // 👇 corregido: incluye /admin/
        const res = await api.get("/admin/sales/get-items.php", {
          params: { sale_id: saleId },
        });

        if (res.data?.success) {
          setSale(res.data.data); // la venta con items
        } else {
          setError(res.data?.error || "Error desconocido");
        }
      } catch (err) {
        setError(err.message || "Error al cargar detalle de venta");
      } finally {
        setLoading(false);
      }
    };

    fetchSaleItems();
  }, [saleId]);

  return { sale, loading, error };
}
