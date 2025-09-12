import { useEffect, useState } from "react";
import useSales from "../hooks/useSales";
import useProducts from "../../products/hooks/useProducts";

export default function SalesPage() {
  const { sales, loading, createSale, getSales } = useSales();
  const { products, reload: reloadProducts } = useProducts();

  const [cart, setCart] = useState([]);

  // 🔹 Cargar ventas al inicio
  useEffect(() => {
    getSales();
  }, []);

  // 🔹 Agregar producto al carrito
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.product_id === product.id);
      if (exists) {
        return prev.map((p) =>
          p.product_id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  // 🔹 Cambiar cantidad
  const updateQty = (id, qty) => {
    setCart((prev) =>
      prev.map((p) =>
        p.product_id === id ? { ...p, quantity: Number(qty) } : p
      )
    );
  };

  // 🔹 Eliminar del carrito
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.product_id !== id));
  };

  // 🔹 Confirmar venta
  const confirmSale = async () => {
    if (cart.length === 0) return;
    const items = cart.map((c) => ({
      product_id: c.product_id,
      quantity: c.quantity,
    }));

    const res = await createSale(items);
    if (res?.success) {
      alert(`Venta registrada (ID: ${res.data.sale_id}) Total: $${res.data.total}`);
      setCart([]);
      getSales();       // refrescar listado
      reloadProducts(); // refrescar stock
    } else {
      alert("Error al registrar venta");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Ventas (POS)</h1>

      {/* 🔎 Productos disponibles */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Productos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {products.map((p) => (
            <div key={p.id} className="border p-2 rounded shadow-sm">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-gray-600">${p.price}</p>
              <p className="text-xs text-gray-500">Stock: {p.stock}</p>
              <button
                className="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-sm"
                onClick={() => addToCart(p)}
              >
                Agregar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 🛒 Carrito */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Carrito</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">No hay productos en el carrito.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Producto</th>
                <th className="p-2 border">Precio</th>
                <th className="p-2 border">Cantidad</th>
                <th className="p-2 border">Subtotal</th>
                <th className="p-2 border"></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((c) => (
                <tr key={c.product_id}>
                  <td className="p-2 border">{c.name}</td>
                  <td className="p-2 border">${c.price}</td>
                  <td className="p-2 border">
                    <input
                      type="number"
                      min="1"
                      value={c.quantity}
                      onChange={(e) => updateQty(c.product_id, e.target.value)}
                      className="w-16 border rounded p-1"
                    />
                  </td>
                  <td className="p-2 border">${c.price * c.quantity}</td>
                  <td className="p-2 border">
                    <button
                      onClick={() => removeFromCart(c.product_id)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-sm"
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {cart.length > 0 && (
          <button
            onClick={confirmSale}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded font-semibold"
          >
            Confirmar Venta
          </button>
        )}
      </div>

      {/* 📜 Historial de ventas */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Ventas recientes</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : sales.length === 0 ? (
          <p className="text-gray-500">No hay ventas registradas.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Fecha</th>
                <th className="p-2 border">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td className="p-2 border">{s.id}</td>
                  <td className="p-2 border">{s.created_at}</td>
                  <td className="p-2 border">${s.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
