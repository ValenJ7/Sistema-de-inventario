// features/reports/hooks/useReportsSummary.js
import { useEffect, useState, useCallback } from "react";
import api from "../../../api/backend";

export default function useReportsSummary(from, to) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/reports/summary.php", { params: { from, to } });
      if (res.data?.success) setSummary(res.data.data);
      else throw new Error(res.data?.error || "Error obteniendo summary");
    } catch (e) {
      setError(e.message ?? String(e));
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { if (from && to) load(); }, [from, to, load]);

  return { summary, loading, error, reload: load };
}
