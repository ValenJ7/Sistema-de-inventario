import { useEffect, useMemo, useRef, useState } from "react";

export default function LocalProductImages({ value = [], onChange }) {
  const [items, setItems] = useState(() =>
    (value || []).map((x, i) => ({ ...x, sort_order: i + 1, _key: makeKey() }))
  );
  const inputRef = useRef(null);

  // notificar a padre
  useEffect(() => {
    onChange?.(items.map((x, i) => ({ ...x, sort_order: i + 1 })));
  }, [items]); // eslint-disable-line

  function handlePick() {
    inputRef.current?.click();
  }

  function onFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const next = items.concat(
      files.map((file) => ({
        _key: makeKey(),
        file,
        url: URL.createObjectURL(file),
      }))
    );
    setItems(next);
    e.target.value = "";
  }

  function moveUp(i) {
    if (i <= 0) return;
    const next = items.slice();
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setItems(next);
  }
  function moveDown(i) {
    if (i >= items.length - 1) return;
    const next = items.slice();
    [next[i + 1], next[i]] = [next[i], next[i + 1]];
    setItems(next);
  }
  function removeAt(i) {
    const it = items[i];
    if (it?.url?.startsWith("blob:")) try { URL.revokeObjectURL(it.url); } catch {}
    const next = items.slice();
    next.splice(i, 1);
    setItems(next);
  }

  const ordered = useMemo(() => items.map((x, i) => ({ ...x, sort_order: i + 1 })), [items]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold">Imágenes del Producto</div>
        <button
          type="button"
          onClick={handlePick}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
        >
          <UploadIcon className="w-4 h-4" /> Subir Imágenes
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={onFiles}
        />
      </div>

      <p className="text-sm text-gray-500">
        Puedes subir múltiples imágenes y ordenarlas. La primera será la principal.
      </p>

      {ordered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
          No hay imágenes. Usá “Subir Imágenes”.
        </div>
      ) : (
        ordered.map((it, idx) => (
          <div key={it._key} className="flex items-center gap-4 rounded-xl border p-3">
            <div className="w-8 h-8 grid place-items-center rounded-lg bg-gray-100 text-sm font-semibold">
              {idx + 1}
            </div>
            <div className="w-20 h-20 overflow-hidden rounded-lg bg-gray-50 border">
              <img src={it.url} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                Imagen {idx + 1}{idx === 0 ? " (Principal)" : ""}
              </div>
              <div className="text-xs text-gray-500">
                {it.file ? it.file.name : "Nueva imagen"}
              </div>
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
        ))
      )}
    </div>
  );
}

function makeKey() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
function ArrowUp(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>);}
function ArrowDown(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>);}
function XIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>);}
function UploadIcon(props){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4-4 4M12 4v12"/></svg>);}
