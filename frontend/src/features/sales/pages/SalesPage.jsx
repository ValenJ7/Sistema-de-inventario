import { useEffect, useState } from "react";
import useSales from "../hooks/useSales";
import useProducts from "../../products/hooks/useProducts";
import useSaleItems from "../hooks/useSaleItems"; // detalle
import AlertModal from "../../../ui/AlertModal";
import ConfirmModal from "../../../ui/ConfirmModal";
import Toast from "../../../ui/Toast";

export default function SalesPage() {
  const { sales, loading, createSale, getSales } = useSales();
  const { products, reload: reloadProducts } = useProducts();

  const [cart, setCart] = useState([]);
  const [alert, setAlert] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const [selectedSaleId, setSelectedSaleId] = useState(null); // id venta
  const { sale, loading: loadingItems, error } = useSaleItems(selectedSaleId); // hook detalle

  const [selectedImage, setSelectedImage] = useState(null); // 👈 imagen ampliada

  // 🔹 Cargar ventas al inicio
  useEffect(() => {
    getSales();
  }, []);

  // 🔹 Agregar producto al carrito
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.product_id === product.id);
      if (exists) {
        const maxStock = product.stock;
        if (exists.quantity + 1 > maxStock) {
          setAlert({
            type: "warning",
            message: `Stock insuficiente: solo hay ${maxStock} unidades de "${product.name}"`,
          });
          return prev;
        }
        return prev.map((p) =>
          p.product_id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  // 🔹 Cambiar cantidad
  const updateQty = (id, qty) => {
    setCart((prev) =>
      prev.map((p) => {
        if (p.product_id === id) {
          const product = products.find((pr) => pr.id === id);
          const maxStock = product?.stock ?? 0;
          const newQty = Math.min(Number(qty), maxStock);
          if (Number(qty) > maxStock) {
            setAlert({
              type: "warning",
              message: `Solo hay ${maxStock} unidades disponibles de "${product.name}"`,
            });
          }
          return { ...p, quantity: newQty };
        }
        return p;
      })
    );
  };

  // 🔹 Pedir confirmación antes de eliminar
  const requestRemove = (id) => {
    const product = cart.find((p) => p.product_id === id);
    setConfirm({
      message: `¿Seguro que querés eliminar "${product?.name}" del carrito?`,
      onConfirm: () => {
        setCart((prev) => prev.filter((p) => p.product_id !== id));
        setConfirm(null);
        setToast({ type: "info", message: "🗑️ Producto eliminado del carrito" });
      },
    });
  };

  // 🔹 Confirmar venta
  const confirmSale = async () => {
    if (cart.length === 0) {
      setAlert({ type: "warning", message: "⚠️ El carrito está vacío" });
      return;
    }

    for (const item of cart) {
      const product = products.find((p) => p.id === item.product_id);
      if (product && item.quantity > product.stock) {
        setAlert({
          type: "warning",
          message: `Stock insuficiente: ${product.name} (Stock: ${product.stock})`,
        });
        return;
      }
    }

    const items = cart.map((c) => ({
      product_id: c.product_id,
      quantity: c.quantity,
    }));

    const res = await createSale(items);
    if (res?.success) {
      setAlert({
        type: "success",
        message: `✅ Venta registrada (ID: ${res.data.sale_id}) Total: $${res.data.total}`,
      });
      setCart([]);
      getSales();
      reloadProducts();
    } else {
      setAlert({ type: "error", message: "❌ Error al registrar venta" });
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
                      onClick={() => requestRemove(c.product_id)}
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
                <th className="p-2 border"></th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td className="p-2 border">{s.id}</td>
                  <td className="p-2 border">{s.created_at}</td>
                  <td className="p-2 border">${s.total}</td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => setSelectedSaleId(s.id)}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 🔍 Modal detalle de venta */}
      {selectedSaleId && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-xl font-bold">
                Detalle de venta #{selectedSaleId}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedSaleId(null)}
              >
                ✕
              </button>
            </div>

            {/* Info general */}
            <p className="text-sm text-gray-500 mb-1">Fecha: {sale?.created_at}</p>
            <p className="text-lg font-semibold mb-4 text-green-600">
              Total: ${sale?.total}
            </p>

            {/* Lista de ítems */}
            <div className="space-y-2">
              {sale?.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-14 h-14 object-cover rounded-md cursor-pointer hover:scale-105 transition"
                      onClick={() => setSelectedImage(item.image_url)}
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium truncate">{item.product_name}</p>
                    <p className="text-sm text-gray-600">
                      {item.size} — {item.quantity} x ${item.price} = ${item.subtotal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🖼 Modal de imagen ampliada */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Producto"
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
            />
            <button
              className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 shadow hover:bg-gray-200"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ⚠️ Modal de alerta */}
      {alert && (
        <AlertModal
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* 🔴 Modal de confirmación */}
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* 🍞 Toast (avisos rápidos) */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
