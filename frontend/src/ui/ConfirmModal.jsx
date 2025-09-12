export default function ConfirmModal({ 
  title = "¿Estás seguro?", 
  message, 
  onConfirm, 
  onCancel 
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-lg shadow-xl p-6 text-center w-96 pointer-events-auto border">
        <h2 className="text-xl font-bold mb-3">{title}</h2>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
