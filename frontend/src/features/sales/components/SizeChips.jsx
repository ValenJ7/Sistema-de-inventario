// components/sales/components/SizeChips.jsx
export default function SizeChips({ variants = [], value, onChange }) {
  if (!variants.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {variants.map(v => {
        const s = Number(v.stock || 0);
        const active = value === v.id;
        const disabled = s <= 0;

        return (
          <button
            key={v.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(v.id)}
            className={[
              "px-2 h-7 rounded-lg text-xs border",
              active ? "bg-black text-white border-black" : "bg-white",
              disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"
            ].join(" ")}
            title={disabled ? "Sin stock" : `${s} unidades`}
          >
            {v.label}{s > 0 ? ` · ${s}` : " · 0"}
          </button>
        );
      })}
    </div>
  );
}
