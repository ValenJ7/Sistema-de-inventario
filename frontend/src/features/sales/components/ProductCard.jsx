import { useState } from "react";
import { money } from "../../../utils/money";
import { Icon } from "../../../utils/icons";
import { getImageUrl } from "../../../utils/getImageUrl";

export default function ProductCard({ product, inCartQty = 0, onAdd, onInc, onDec }) {
  const out = Number(product.stock) <= 0;
  const low = !out && Number(product.stock) < 5;

  // toma principal: primero image_path, si no main_image
  const srcRel = product?.image_path || product?.main_image || null;
  const initialSrc = srcRel ? getImageUrl(srcRel) : null;

  // si la imagen da error, caemos al placeholder
  const [broken, setBroken] = useState(false);
  const hasImage = Boolean(initialSrc) && !broken;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-3">
      {/* Imagen / placeholder */}
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-50 grid place-items-center text-gray-400">
        {hasImage ? (
          <img
            src={initialSrc}
            alt={product?.name || "Producto"}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setBroken(true)}
          />
        ) : (
          <Icon.Box />
        )}
      </div>

      <div className="mt-3">
        <div className="text-sm text-gray-600 truncate">{product.name}</div>
        <div className="text-lg font-semibold mt-1">{money(product.price)}</div>

        <div className="mt-2">
          {out ? (
            <span className="inline-block text-xs px-2 py-0.5 rounded-md bg-red-100 text-red-700">Sin stock</span>
          ) : low ? (
            <span className="inline-block text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">Stock: {product.stock}</span>
          ) : (
            <span className="inline-block text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">Stock: {product.stock}</span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            disabled={out || inCartQty === 0}
            onClick={() => onDec(product.id)}
            className={`h-8 w-8 grid place-items-center rounded-full border ${
              out || inCartQty === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
            title="Quitar 1"
          >
            <Icon.Minus />
          </button>

          <div className="min-w-8 text-center text-sm">{inCartQty}</div>

          <button
            disabled={out}
            onClick={() => onAdd(product)}
            className={`h-8 w-8 grid place-items-center rounded-full border ${
              out ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
            title="Agregar 1"
          >
            <Icon.Plus />
          </button>

          <button
            disabled={out}
            onClick={() => onAdd(product)}
            className={`ml-auto px-3 h-8 rounded-xl text-sm text-white ${
              out ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-neutral-800"
            }`}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
