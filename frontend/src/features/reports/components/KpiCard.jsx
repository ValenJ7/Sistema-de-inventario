// features/reports/components/KpiCard.jsx
export default function KpiCard({ title, value, hint, right }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">{title}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
          {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
        </div>
        {right}
      </div>
    </div>
  );
}
