import { useEffect, useState } from "react";
import { fetchReadyToShipOrders } from "../../../api/ordersApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function OrdersToShip() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const result = await fetchReadyToShipOrders(token);

        console.log("READY ORDERS RESULT:", result);
        setOrders(Array.isArray(result) ? result : []);
      } catch (err) {
        toast.error(err.toString());
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Pedidos para despachar</h1>

      {loading ? (
        <p>Cargando...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No hay pedidos listos para despachar.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="border px-2 py-1">ID</th>
                <th className="border px-2 py-1">Cliente</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Total</th>
                <th className="border px-2 py-1">Pago</th>
                <th className="border px-2 py-1">Envío</th>
                <th className="border px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="border px-2 py-1">{o.id}</td>
                  <td className="border px-2 py-1">{o.customer_name}</td>
                  <td className="border px-2 py-1">{o.customer_email}</td>
                  <td className="border px-2 py-1">${o.total}</td>
                  <td className="border px-2 py-1">{o.payment_status}</td>
                  <td className="border px-2 py-1">{o.shipping_status}</td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => navigate(`/admin/pedidos/${o.id}`)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
