import CartItems from "./CartItems";
import { money } from "../../../utils/money";
import { Icon } from "../../../utils/icons";

export default function CartPanel({
  cart,
  subTotal,
  taxes,
  total,
  taxRate,
  isSaving,
  onDec,
  onInc,
  onRemove,
  onConfirmSale,
  onHoldSale,
}) {
  return (
    <div className="space-y-3">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
        {/* Header carrito */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-semibold">
            <Icon.Cart />
            <span>Carrito</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
              {cart.reduce((a, c) => a + c.quantity, 0)}
            </span>
          </div>
        </div>

        {/* Items */}
        {cart.length === 0 ? (
          <p className="text-gray-500">No hay productos en el carrito.</p>
        ) : (
          <div className="space-y-3">
            {cart.map((c) => (
              <CartItems items={cart} onDec={onDec} onInc={onInc} onRemove={onRemove} />
            ))}

            {/* Totales */}
            <div className="mt-2 pt-2 border-t text-sm">
              <div className="flex justify-between py-1">
                <span>Subtotal:</span>
                <span>{money(subTotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Impuestos ({Math.round(taxRate * 100)}%):</span>
                <span>{money(taxes)}</span>
              </div>
              <div className="flex justify-between py-2 mt-2 border-t font-semibold text-lg">
                <span>Total:</span>
                <span>{money(total)}</span>
              </div>
            </div>

            {/* Acciones */}
            <button
              onClick={onConfirmSale}
              disabled={isSaving || cart.length === 0}
              className={`w-full h-11 rounded-xl text-white font-medium flex items-center justify-center gap-2 ${
                isSaving ? "bg-emerald-400 cursor-not-allowed" : "bg-black hover:bg-neutral-800"
              }`}
            >
              <Icon.Card className="text-white" />
              {isSaving ? "Procesando…" : "Procesar Pago"}
            </button>

            <button
              onClick={onHoldSale}
              className="w-full h-11 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
            >
              <Icon.Save />
              Guardar Venta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
