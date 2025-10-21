import useCart from "../useCart";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const list = Object.values(items);

  const handleConfirm = (e) => {
    e.preventDefault();
    alert("Compra confirmada (simulación)");
    clear();
    navigate("/tienda");
  };

  return (
    <div className="container mx-auto px-6 py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Finalizar compra</h1>

      {list.length === 0 ? (
        <p className="text-center text-gray-500">Tu carrito está vacío.</p>
      ) : (
        <>
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

          <div className="flex justify-between font-semibold mb-6">
            <span>Total</span>
            <span>${Number(subtotal).toLocaleString("es-AR")}</span>
          </div>

          <form onSubmit={handleConfirm} className="space-y-4 mb-8">
            <input
              type="text"
              placeholder="Nombre completo"
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Dirección"
              className="w-full border p-2 rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-900 transition"
            >
              Confirmar compra
            </button>
          </form>
        </>
      )}
    </div>
  );
}
