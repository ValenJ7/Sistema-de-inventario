// components/ui/ProductImageGallery.jsx
import { useMemo } from "react";

/**
 * Lista ordenable con flechas ↑/↓, botón eliminar y estrella para marcar principal.
 * Se asume que la lista viene normalizada (solo la primera es principal).
 *
 * props:
 * - images: [{id, url, sort_order, is_main}]
 * - onDeleteImage: (id) => void|Promise
 * - onSetMain: (id) => void|Promise
 * - onReorder: (newOrderIds) => void|Promise
 */
export default function ProductImageGallery({
  images = [],
  onDeleteImage,
  onSetMain,
  onReorder,
}) {
  const ordered = useMemo(
    () => (images || []).slice().sort((a, b) => a.sort_order - b.sort_order),
    [images]
  );

  const moveUp = (index) => {
    if (index <= 0) return;
    const ids = ordered.map((x) => x.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    onReorder?.(ids);
  };

  const moveDown = (index) => {
    if (index >= ordered.length - 1) return;
    const ids = ordered.map((x) => x.id);
    [ids[index + 1], ids[index]] = [ids[index], ids[index + 1]];
    onReorder?.(ids);
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">
        Imágenes ordenadas (la primera será la principal):
      </div>

      {ordered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
          No hay imágenes cargadas aún.
        </div>
      ) : (
        ordered.map((img, idx) => (
          <div
            key={img.id}
            className="flex items-center gap-4 rounded-xl border p-3"
          >
            <div className="w-8 h-8 grid place-items-center rounded-lg bg-gray-100 text-sm font-semibold">
              {idx + 1}
            </div>

            <div className="w-24 h-24 overflow-hidden rounded-lg bg-gray-50 border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={`Imagen ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                Imagen {idx + 1}{idx === 0 ? " (Principal)" : ""}
              </div>
              <div className="text-xs text-gray-500">ID #{img.id}</div>
            </div>

            <div className="flex items-center gap-2">
              {/* Marcar como principal: solo visualmente “activada” en el primer ítem */}
              <button
                type="button"
                onClick={() => onSetMain?.(img.id)}
                title="Marcar como principal"
                className={`h-9 w-9 grid place-items-center rounded-lg border hover:bg-gray-50 ${
                  idx === 0 ? "text-yellow-600 border-yellow-300" : ""
                }`}
              >
                <StarIcon className="w-4 h-4" filled={idx === 0} />
              </button>

              {/* Mover arriba/abajo */}
              <button
                type="button"
                onClick={() => moveUp(idx)}
                disabled={idx === 0}
                title="Subir"
                className="h-9 w-9 grid place-items-center rounded-lg border hover:bg-gray-50 disabled:opacity-40"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveDown(idx)}
                disabled={idx === ordered.length - 1}
                title="Bajar"
                className="h-9 w-9 grid place-items-center rounded-lg border hover:bg-gray-50 disabled:opacity-40"
              >
                <ArrowDown className="w-4 h-4" />
              </button>

              {/* Eliminar */}
              <button
                type="button"
                onClick={() => onDeleteImage?.(img.id)}
                title="Eliminar"
                className="h-9 w-9 grid place-items-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* Iconos inline */

function ArrowUp(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}
function ArrowDown(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
function TrashIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m1 0l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0v14m4-14v14m4-14v14" />
    </svg>
  );
}
function StarIcon({ filled, ...props }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.83 6.63L22 9.24l-5 4.36L18.18 21 12 17.27 5.82 21 7 13.6l-5-4.36 7.17-.61L12 2z" />
    </svg>
  );
}
