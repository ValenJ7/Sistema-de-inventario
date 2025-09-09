// components/ui/ImagePickerPro.jsx
import { useRef, useState, useEffect } from "react";

export default function ImagePickerPro({
  label = "Imagen principal",
  value,              // string | null (URL actual o preview)
  onChangeFile,       // (File|null) => void
  accept = ["image/jpeg", "image/png", "image/webp"],
  maxSizeMB = 5,
  className = "",
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [fileMeta, setFileMeta] = useState(null); // {name, sizeKB}

  useEffect(() => () => setError(""), []);

  const openDialog = () => inputRef.current?.click();

  const validate = (file) => {
    if (!file) return { ok: true };
    if (!accept.includes(file.type))
      return { ok: false, msg: "Formato no permitido (JPG, PNG o WEBP)." };
    if (file.size > maxSizeMB * 1024 * 1024)
      return { ok: false, msg: `El archivo supera ${maxSizeMB}MB.` };
    return { ok: true };
  };

  const handleFile = (file) => {
    const v = validate(file);
    if (!v.ok) {
      setError(v.msg);
      setFileMeta(null);
      onChangeFile(null);
      return;
    }
    setError("");
    setFileMeta(file ? { name: file.name, sizeKB: Math.round(file.size / 1024) } : null);
    onChangeFile(file);
  };

  const onInputChange = (e) => handleFile(e.target.files?.[0] || null);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0] || null);
  };

  const clearSelection = (e) => {
    e?.stopPropagation?.();
    if (inputRef.current) inputRef.current.value = "";
    setFileMeta(null);
    setError("");
    onChangeFile(null);
  };

  const borderColor = error
    ? "border-red-400 bg-red-50"
    : dragOver
    ? "border-blue-500 bg-blue-50"
    : "border-gray-300 hover:border-blue-400";

  return (
    <div className={`space-y-2 ${className}`}>
      {/* DROPZONE */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Selector de imagen. Click o arrastrar para cargar."
        className={[
          "relative", // 👈 necesario para posicionar el botón dentro
          "rounded-2xl border-2 border-dashed p-5 transition cursor-pointer bg-white outline-none",
          borderColor,
        ].join(" ")}
        onClick={openDialog}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openDialog()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="h-16 w-16 flex-shrink-0 rounded-xl border bg-gray-50 overflow-hidden group">
            {value ? (
              <img
                src={value}
                alt="preview"
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-gray-400">
                {/* Ícono imagen */}
                <svg viewBox="0 0 24 24" className="h-6 w-6">
                  <path fill="currentColor" d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14h18zM5 5h14v9l-3.5-3.5-3.5 3.5-2-2L5 16V5zm-2 18h18v-2H3v2z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Texto + meta */}
          <div className="flex-1">
            <p className="text-sm font-medium flex items-center gap-2">
              {/* Ícono subir */}
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-blue-600">
                <path fill="currentColor" d="M7 20h10v-2H7v2zM12 2l5 5h-3v6h-4V7H7l5-5z"/>
              </svg>
              Arrastrá y soltá la imagen aquí
            </p>
            <p className="text-xs text-gray-500">
              o <span className="text-blue-600 underline">hacé clic para explorar</span>
            </p>

            {fileMeta && (
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-medium">{fileMeta.name}</span> • {fileMeta.sizeKB} KB
              </p>
            )}
            {!!error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>
        </div>

        {/* Botón TRASH dentro del dropzone (arriba a la derecha) */}
        {(value || fileMeta) && (
          <button
            type="button"
            onClick={clearSelection}
            title="Quitar selección"
            className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-white/90 hover:bg-white shadow-sm"
          >
            {/* Ícono trash */}
            <svg viewBox="0 0 24 24" className="h-4 w-4">
              <path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 7h2v8h-2v-8zm4 0h2v8h-2v-8zM7 10h2v8H7v-8z"/>
            </svg>
          </button>
        )}

        {/* Input real oculto */}
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(",")}
          className="hidden"
          onChange={onInputChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
