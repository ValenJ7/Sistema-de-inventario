import { useEffect } from "react";

export default function ModalShell({ open, onClose, title, children, footer }) {
  // bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Caja del modal: tamaño controlado, contenido scrolleable */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Limita alto para que NO ocupe toda la pantalla */}
        <div className="max-h-[85vh] grid grid-rows-[auto,1fr,auto]">
          {/* Header fijo */}
          <div className="px-6 py-4 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold truncate">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-lg px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Contenido con scroll */}
          <div className="overflow-y-auto px-6 py-4">{children}</div>

          {/* Footer fijo */}
          <div className="px-6 py-4 border-t sticky bottom-0 bg-white z-10">
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
