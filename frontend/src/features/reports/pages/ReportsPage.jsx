import { useEffect, useState } from "react";
import DateRangeFilter from "../components/DateRangeFilter";
import KpiGrid from "../components/KpiGrid";
import SalesHistory from "../components/SalesHistory";
import SaleDetailModal from "../components/SaleDetailModal";

import useReportsSummary from "../hooks/useReportsSummary";
import useSalesHistory from "../hooks/useSalesHistory";
import useSaleDetail from "../hooks/useSaleDetail";

// helpers fecha
function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function addDaysISO(baseISO, days) {
  const d = new Date(baseISO + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function ReportsPage() {
  // rango por defecto: últimos 7 días
  const defaultTo = todayISO();
  const defaultFrom = addDaysISO(defaultTo, -6);
  const [range, setRange] = useState({ from: defaultFrom, to: defaultTo });

  // paginación
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // hooks (usan from y to por separado)
  const { summary } = useReportsSummary(range.from, range.to);
  const {
    rows: historyRows,
    total_rows: historyTotal,
  } = useSalesHistory(range.from, range.to, page, pageSize);

  // modal detalle
  const [selectedId, setSelectedId] = useState(null);
  const { sale } = useSaleDetail(selectedId);

  // reset de página al cambiar el rango
  useEffect(() => { setPage(1); }, [range.from, range.to]);

  return (
    <div className="min-h-screen bg-[#FBF4EA]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold">Reportes</h1>

        <DateRangeFilter value={range} onChange={setRange} />

        <div className="mt-6">
          <KpiGrid summary={summary} />
        </div>

        <div className="mt-6">
          <SalesHistory
            rows={historyRows}
            totalRows={historyTotal}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onRowClick={setSelectedId}   // ← abre modal
          />
        </div>
      </div>

      <SaleDetailModal
        open={!!selectedId}
        sale={sale}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
