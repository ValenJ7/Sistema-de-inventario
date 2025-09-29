// components/ui/FiltersBar.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../../../../api/backend";

export default function FiltersBar({ value, onChange, onClear }) {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('admin/categories/get-categories.php');
        const rows = Array.isArray(res?.data) ? res.data
                  : Array.isArray(res?.data?.data) ? res.data.data : [];
        setCats(rows.map(r => ({ id: Number(r.id), name: r.name })));
      } catch (e) {
        setCats([]);
      }
    })();
  }, []);

  const v = value || {};
  const [q, setQ] = useState(v.q || "");
  useEffect(() => { setQ(v.q || "") }, [v.q]);

  // debounce simple
  useEffect(() => {
    const t = setTimeout(() => onChange({ ...v, q, page: 1 }), 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[220px]">
        <label className="block text-sm text-gray-600 mb-1">Buscar</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre..."
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Categoría</label>
        <select
          value={v.categoryId ?? ""}
          onChange={(e) => onChange({ ...v, categoryId: e.target.value ? Number(e.target.value) : null, page: 1 })}
          className="border rounded-lg px-3 py-2 min-w-[180px]"
        >
          <option value="">Todas</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">Stock</label>
        <select
          value={v.stock || "any"}
          onChange={(e) => onChange({ ...v, stock: e.target.value, page: 1 })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="any">Cualquiera</option>
          <option value="in">Con stock</option>
          <option value="out">Sin stock</option>
        </select>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onClear}
          className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
