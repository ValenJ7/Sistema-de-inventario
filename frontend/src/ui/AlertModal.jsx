export default function AlertModal({ type = "info", message, onClose }) {
  const styles = {
    success: "bg-green-100 text-green-800 border-green-400",
    error: "bg-red-100 text-red-800 border-red-400",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-400",
    info: "bg-blue-100 text-blue-800 border-blue-400",
  };

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-lg shadow-xl p-6 text-center w-96 pointer-events-auto border">
        <div className={`mb-4 p-3 rounded border ${styles[type]}`}>
          <span className="text-2xl mr-2">{icons[type]}</span>
          <span className="font-semibold">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Okey
        </button>
      </div>
    </div>
  );
}
