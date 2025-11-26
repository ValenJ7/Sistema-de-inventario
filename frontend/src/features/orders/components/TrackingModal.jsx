import { useState } from 'react';
import toast from 'react-hot-toast';
import { addTrackingNumber } from '../../../api/ordersApi';

export default function TrackingModal({ orderId, onClose, onSuccess }) {
  const [tracking, setTracking] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("access_token");

  async function handleSubmit() {
    if (!tracking.trim()) return toast.error('Ingresa un código');

    setLoading(true);
    try {
      await addTrackingNumber(orderId, tracking, token);
      toast.success('Tracking cargado');
      onSuccess(tracking);
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
        <h2 className="text-lg font-semibold mb-3">Cargar Tracking</h2>

        <input
          type="text"
          className="w-full border p-2 mb-3"
          placeholder="Código"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
