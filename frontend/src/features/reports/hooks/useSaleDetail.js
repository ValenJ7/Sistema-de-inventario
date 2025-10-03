// features/reports/hooks/useSaleDetail.js
import { useEffect, useState } from "react";
import api from "../../../api/backend";

export default function useSaleDetail(saleId) {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!saleId) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/admin/reports/sale-detail.php", { params: { sale_id: saleId } });
        if (!cancelled) {
          if (res.data?.success) setSale(res.data.data);
          else throw new Error(res.data?.error || "Error obteniendo detalle");
        }
      } catch (e) {
        if (!cancelled) setError(e.message ?? String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [saleId]);

  return { sale, loading, error };
}
