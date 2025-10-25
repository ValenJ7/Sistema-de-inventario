import useCart from "../useCart";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const navigate = useNavigate();

  const list = Object.values(items);

  // 👉 En lugar de confirmar directamente, vamos al paso de envío
  const handleContinueToShipping = (e) => {
    e.preventDefault();
    if (list.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    navigate("/checkout/shipping");
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Finalizar compra</h1>

      {list.length === 0 ? (
        <p className="text-center text-gray-500">Tu carrito está vacío.</p>
      ) : (
        <>
          {/* 🔹 Resumen del pedido */}
          <div className="space-y-4 border-b pb-4 mb-6">
            {list.map((it) => (
              <div key={it.id + it.variant} className="flex justify-between">
                <span>
                  {it.name} {it.variant && `(${it.variant})`} × {it.qty}
                </span>
                <span>
                  ${Number(it.price * it.qty).toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>

          {/* 🔹 Total */}
          <div className="flex justify-between font-semibold mb-6">
            <span>Total</span>
            <span>${Number(subtotal).toLocaleString("es-AR")}</span>
          </div>

          {/* 🔹 Botón para pasar al paso de envío */}
          <form onSubmit={handleContinueToShipping} className="space-y-4 mb-8">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
            >
              Continuar con el envío
            </button>
          </form>
        </>
      )}
    </div>
  );
}
