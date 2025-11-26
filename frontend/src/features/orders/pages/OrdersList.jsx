import { useEffect, useState } from 'react';
import { fetchOrders } from '../../../api/ordersApi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");

 useEffect(() => {
  async function load() {
    try {
      const result = await fetchOrders(token);

      console.log("FETCH ORDERS RESULT:", result); // DEBUG

      setOrders(Array.isArray(result) ? result : []);
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setLoading(false);
    }
  }
  load();
}, []);


  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Pedidos</h1>

      {loading && <p>Cargando pedidos...</p>}

      {!loading && (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Cliente</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Pago</th>
              <th className="p-2 border">Envío</th>
              <th className="p-2 border"></th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="border p-2">{o.id}</td>
                <td className="border p-2">{o.customer_name}</td>
                <td className="border p-2">{o.customer_email}</td>
                <td className="border p-2">${o.total}</td>
                <td className="border p-2">{o.payment_status}</td>
                <td className="border p-2">{o.shipping_status}</td>
                <td className="border p-2">
                  <Link
                    to={`/admin/pedidos/${o.id}`}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
