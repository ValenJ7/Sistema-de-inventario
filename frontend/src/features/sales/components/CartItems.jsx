import { money } from "../../../utils/money";
import { Icon } from "../../../utils/icons";

export default function CartItems({ items, onDec, onInc, onRemove }) {
  if (!items?.length) return null;

  return (
    <div className="space-y-3">
      {items.map((c) => (
        <div key={c.product_id} className="flex items-center gap-2">
          <div className="flex-1">
            <div className="text-sm font-medium truncate">{c.name}</div>
            <div className="text-xs text-gray-500">{money(c.price)} c/u</div>
          </div>

          <button
            onClick={() => onDec(c.product_id)}
            className="h-8 w-8 grid place-items-center rounded-full bg-gray-100 hover:bg-gray-200"
            title="Quitar 1"
          >
            <Icon.Minus />
          </button>

          <div className="w-8 text-center text-sm">{c.quantity}</div>

          <button
            onClick={() => onInc(c.product_id)}
            className="h-8 w-8 grid place-items-center rounded-full bg-gray-100 hover:bg-gray-200"
            title="Agregar 1"
          >
            <Icon.Plus />
          </button>

          <button
            onClick={() => onRemove(c.product_id)}
            className="h-8 w-8 grid place-items-center rounded-full bg-red-100 text-red-700 hover:bg-red-200 ml-2"
            title="Eliminar"
          >
            <Icon.Trash />
          </button>
        </div>
      ))}
    </div>
  );
}
