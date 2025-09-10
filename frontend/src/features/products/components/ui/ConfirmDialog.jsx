import React from "react";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Fondo oscuro */}
      <button
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-label="Cerrar"
      />

      {/* Contenedor modal */}
      <div className="relative bg-white rounded-xl shadow-lg max-w-sm w-full p-6 z-10">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
            type="button"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
