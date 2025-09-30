// features/reports/hooks/useSalesHistory.js
import { useEffect, useState, useCallback } from "react";
import api from "../../../api/backend";

export default function useSalesHistory(from, to, page = 1, pageSize = 25) {
  const [data, setData] = useState({ rows: [], total_rows: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/reports/sales-list.php", {
        params: { from, to, page, page_size: pageSize },
      });
      if (res.data?.success) setData(res.data.data || { rows: [], total_rows: 0 });
      else throw new Error(res.data?.error || "Error obteniendo historial");
    } catch (e) {
      setError(e.message ?? String(e));
      setData({ rows: [], total_rows: 0 });
    } finally {
      setLoading(false);
    }
  }, [from, to, page, pageSize]);

  useEffect(() => { if (from && to) load(); }, [from, to, page, pageSize, load]);

  return { ...data, loading, error, reload: load };
}
