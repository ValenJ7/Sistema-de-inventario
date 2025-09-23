export default function CategoryChips({ categories, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        className={`px-3 py-1.5 rounded-full text-sm border ${
          selected === "" ? "bg-black text-white border-black" : "bg-white border-gray-200 hover:bg-gray-50"
        }`}
        onClick={() => onSelect("")}
      >
        Todos
      </button>

      {categories.map((c) => (
        <button
          key={c.value}
          className={`px-3 py-1.5 rounded-full text-sm border ${
            selected === c.value ? "bg-black text-white border-black" : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
          onClick={() => onSelect(c.value)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
