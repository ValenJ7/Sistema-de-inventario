// features/reports/components/DateRangeFilter.jsx
import { useMemo } from "react";

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
function monthStartISO(dateISO) {
  const d = new Date(dateISO + "T00:00:00");
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export default function DateRangeFilter({ value, onChange }) {
  const { from, to } = value || {};
  const isCustom = useMemo(() => false, []); // placeholder by design

  const setQuick = (type) => {
    const t = todayISO();
    if (type === "today") onChange({ from: t, to: t });
    if (type === "7d") onChange({ from: addDaysISO(t, -6), to: t });
    if (type === "month") onChange({ from: monthStartISO(t), to: t });
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex gap-2">
        <button onClick={() => setQuick("today")} className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">
          Hoy
        </button>
        <button onClick={() => setQuick("7d")} className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">
          Últimos 7 días
        </button>
        <button onClick={() => setQuick("month")} className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">
          Mes actual
        </button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Desde</label>
        <input
          type="date"
          value={from || ""}
          onChange={(e) => onChange({ from: e.target.value || null, to })}
          className="rounded-lg border px-2 py-1"
        />
        <label className="text-sm text-gray-600">Hasta</label>
        <input
          type="date"
          value={to || ""}
          onChange={(e) => onChange({ from, to: e.target.value || null })}
          className="rounded-lg border px-2 py-1"
        />
      </div>
    </div>
  );
}
