import { useEffect, useMemo, useRef, useState } from "react";

/**
 * value: [{ id?, url, sort_order? }]  // imágenes existentes (del backend)
 * onChange: ({ images, deleteIds }) => void
 *
 * Cada item en `images` puede tener:
 * - id: number|string (si existe en DB)
 * - url: string (preview o URL absoluta)
 * - file: File (si es nueva)
 * - sort_order: number (1 = principal)
 */
export default function ProductImages({ value = [], onChange }) {
  const [items, setItems] = useState(() =>
    (value || [])
      .slice()
      .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999))
      .map((x) => ({ ...x, _key: makeKey(x.id) }))
  );
  const [deleteIds, setDeleteIds] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    onChange?.({ images: withOrders(items), deleteIds });
  }, [items, deleteIds]); // eslint-disable-line

  useEffect(() => {
    // si cambia el value externo (p.ej. al editar otro producto)
    setItems(
      (value || [])
        .slice()
        .sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999))
        .map((x) => ({ ...x, _key: makeKey(x.id) }))
    );
    setDeleteIds([]);
  }, [JSON.stringify(value)]); // actualización simple y robusta

  function handlePick() {
    inputRef.current?.click();
  }

  function handleFilesSelected(ev) {
    const files = Array.from(ev.target.files || []);
    if (!files.length) return;

    const next = items.concat(
      files.map((file) => ({
        _key: makeKey(),
        file,
        url: URL.createObjectURL(file),
      }))
    );
    setItems(next);
    // Limpio el input para permitir volver a elegir lo mismo si hace falta
    ev.target.value = "";
  }

  function moveUp(index) {
    if (index <= 0) return;
    const next = items.slice();
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setItems(next);
  }

  function moveDown(index) {
    if (index >= items.length - 1) return;
    const next = items.slice();
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    setItems(next);
  }

  function removeAt(index) {
    const it = items[index];
    if (it?.id) setDeleteIds((d) => Array.from(new Set([...d, it.id])));
    // Revoke URL blob si corresponde
    if (it?.file && it?.url?.startsWith("blob:")) {
      try { URL.revokeObjectURL(it.url); } catch {}
    }
    const next = items.slice();
    next.splice(index, 1);
    setItems(next);
  }

  const ordered = useMemo(() => withOrders(items), [items]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">Imágenes del Producto</div>
        <button
          type="button"
          onClick={handlePick}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          <UploadIcon className="w-4 h-4" />
          Subir Imágenes
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
      </div>

      <p className="text-sm text-gray-500">
        Puedes subir múltiples imágenes y ordenarlas. La primera será la principal.
      </p>

      {/* Lista ordenable */}
      <div className="space-y-3">
        {ordered.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
            No hay imágenes. Usá “Subir Imágenes”.
          </div>
        )}

        {ordered.map((it, idx) => (
          <div
            key={it._key}
            className="flex items-center gap-4 rounded-xl border p-3"
          >
            <div className="w-8 h-8 grid place-items-center rounded-lg bg-gray-100 text-sm font-semibold">
              {idx + 1}
            </div>

            <div className="w-20 h-20 overflow-hidden rounded-lg bg-gray-50 border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.url}
                alt={`Imagen ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                Imagen {idx + 1}{idx === 0 ? " (Principal)" : ""}
              </div>
              {it.id ? (
                <div className="text-xs text-gray-500">ID #{it.id}</div>
              ) : (
                <div className="text-xs text-gray-500">Nueva (sin guardar)</div>
              )}
            </div>

            <div className="flex items-center gap-2">
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
              <button
                type="button"
                onClick={() => removeAt(idx)}
                title="Eliminar"
                className="h-9 w-9 grid place-items-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Helpers */

function withOrders(arr) {
  // asegura sort_order = índice+1
  return arr.map((x, i) => ({ ...x, sort_order: i + 1 }));
}

function makeKey(seed) {
  return `${seed ?? "tmp"}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

/* Iconitos inline (sin dependencias) */

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
function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function UploadIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4-4 4M12 4v12" />
    </svg>
  );
}
