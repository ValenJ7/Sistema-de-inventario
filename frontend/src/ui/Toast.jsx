import { useEffect } from "react";

export default function Toast({ type = "info", message, onClose }) {
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

  // Auto-cierre en 3 segundos
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`flex items-center space-x-2 px-4 py-2 rounded shadow-lg border ${styles[type]}`}
      >
        <span className="text-lg">{icons[type]}</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
