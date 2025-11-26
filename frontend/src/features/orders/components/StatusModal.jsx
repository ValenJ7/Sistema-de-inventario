import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateShippingStatus } from '../../../api/ordersApi';

const statuses = ['pendiente', 'preparando', 'enviado', 'entregado'];

export default function StatusModal({ orderId, onClose, onSuccess }) {
  const [status, setStatus] = useState('pendiente');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("access_token");

  async function handleSubmit() {
    setLoading(true);
    try {
      await updateShippingStatus(orderId, status, token);
      toast.success('Estado actualizado');
      onSuccess(status);
      onClose();
    } catch (e) {
      toast.error(e.toString());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow w-80">
        <h2 className="text-lg font-semibold mb-3">Cambiar Estado</h2>

        <select
          className="w-full border p-2 mb-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
