import { Icon } from "../../../utils/icons"

export default function SearchBar({ value, onChange, inputRef, placeholder = "Buscar…" }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Icon.Search />
      </span>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 bg-white/70 focus:bg-white outline-none focus:ring-2 focus:ring-amber-300"
      />
    </div>
  );
}
