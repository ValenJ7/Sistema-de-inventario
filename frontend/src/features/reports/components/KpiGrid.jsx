// features/reports/components/KpiGrid.jsx
import KpiCard from "./KpiCard";
import { money } from "../../../utils/money";

export default function KpiGrid({ summary }) {
  const s = summary || { total_amount: 0, orders: 0, items: 0, avg_ticket: 0 };
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard title="Ventas" value={money(s.total_amount)} />
      <KpiCard title="Tickets" value={s.orders} />
      <KpiCard title="Ítems vendidos" value={s.items} />
      <KpiCard title="Ticket promedio" value={money(s.avg_ticket)} />
    </div>
  );
}
