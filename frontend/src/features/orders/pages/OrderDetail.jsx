import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  fetchOrderById,
} from '../../../api/ordersApi';

import TrackingModal from '../components/TrackingModal';
import StatusModal from '../components/StatusModal';

export default function OrderDetail() {
  const { id } = useParams();
  const token = localStorage.getItem("access_token");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchOrderById(id, token);
        setOrder(data);
      } catch (e) {
        toast.error(e.toString());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p className="p-6">Cargando pedido...</p>;
  if (!order) return <p className="p-6">Pedido no encontrado.</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Pedido #{order.id}</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-semibold mb-2">Datos del Cliente</h2>
          <p><b>Nombre:</b> {order.customer_name}</p>
          <p><b>Email:</b> {order.customer_email}</p>
          <p><b>Dirección:</b> {order.address}</p>
        </div>

        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-semibold mb-2">Pago y Envío</h2>
          <p><b>Total:</b> ${order.total}</p>
          <p><b>Pago:</b> {order.payment_status}</p>
          <p><b>Envío:</b> {order.shipping_status}</p>
          <p><b>Tracking:</b> {order.tracking_number || 'Sin asignar'}</p>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setShowTrackingModal(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Cargar tracking
            </button>

            <button
              onClick={() => setShowStatusModal(true)}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Cambiar estado
            </button>

            {order.tracking_number && (
              <a
                href={`${import.meta.env.VITE_API_URL}/shipping/track.php?code=${order.tracking_number}`}
                target="_blank"
                className="px-3 py-1 bg-gray-700 text-white rounded"
              >
                Ver seguimiento
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="mt-6 border p-4 rounded">
        <h2 className="font-semibold mb-2">Productos</h2>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Producto</th>
              <th className="border p-2">Cantidad</th>
              <th className="border p-2">Precio</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="border p-2">{item.product_name}</td>
                <td className="border p-2">{item.quantity}</td>
                <td className="border p-2">${item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showTrackingModal && (
        <TrackingModal
          orderId={order.id}
          onClose={() => setShowTrackingModal(false)}
          onSuccess={(tracking) => {
            setOrder({ ...order, tracking_number: tracking });
          }}
        />
      )}

      {showStatusModal && (
        <StatusModal
          orderId={order.id}
          onClose={() => setShowStatusModal(false)}
          onSuccess={(status) => {
            setOrder({ ...order, shipping_status: status });
          }}
        />
      )}
    </div>
  );
}
