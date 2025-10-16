// features/sales/components/ProductCard.jsx
import { useMemo, useState } from "react";
import { money } from "../../../utils/money";
import { Icon } from "../../../utils/icons";
import { getImageUrl } from "../../../utils/getImageUrl";

function SizeChips({ variants = [], value, onChange }) {
  if (!variants.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {variants.map((v) => {
        const s = Number(v.stock || 0);
        const active = value === v.id;
        const disabled = s <= 0;

        return (
          <button
            key={v.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(v.id)}
            className={[
              "px-2 h-7 rounded-lg text-xs border",
              active ? "bg-black text-white border-black" : "bg-white",
              disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50",
            ].join(" ")}
            title={disabled ? "Sin stock" : `${s} unidades`}
          >
            {v.label} {s > 0 ? `· ${s}` : "· 0"}
          </button>
        );
      })}
    </div>
  );
}

export default function ProductCard({
  product,
  getQty, // (productId, variantId) => cantidad en carrito
  onAdd,  // (product, variant) => void
  onInc,  // (productId, variantId) => void
  onDec,  // (productId, variantId) => void
}) {
  const srcRel = product?.image_path || product?.main_image || null;
  const initialSrc = srcRel ? getImageUrl(srcRel) : null;
  const [broken, setBroken] = useState(false);
  const hasImage = Boolean(initialSrc) && !broken;

  const variants = Array.isArray(product?.variants) ? product.variants : [];

  // Variante inicial: la primera con stock > 0
  const initialVariantId = useMemo(() => {
    if (!variants.length) return null;
    const withStock = variants.find((v) => Number(v.stock) > 0);
    return withStock ? withStock.id : null;
  }, [variants]);

  const [variantId, setVariantId] = useState(initialVariantId);
  const variant = variants.find((v) => v.id === variantId) || null;

  const currentStock = variant
    ? Number(variant.stock || 0)
    : Number(product.stock_total ?? product.stock ?? 0);

  const out = currentStock <= 0;
  const low = !out && currentStock < 5;
  const inCartQty = getQty ? getQty(product.id, variant?.id ?? null) : 0;
  const canAdd = variants.length === 0 ? !out : !!variant && currentStock > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-3">
      {/* Imagen */}
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

        {/* Selector de talles */}
        <SizeChips variants={variants} value={variantId} onChange={setVariantId} />

        <div className="mt-2">
          {out ? (
            <span className="inline-block text-xs px-2 py-0.5 rounded-md bg-red-100 text-red-700">
              Sin stock
            </span>
          ) : low ? (
            <span className="inline-block text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">
              Stock: {currentStock}
            </span>
          ) : (
            <span className="inline-block text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
              Stock: {currentStock}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            disabled={out || inCartQty === 0}
            onClick={() => onDec(product.id, variant?.id ?? null)}
            className={`h-8 w-8 grid place-items-center rounded-full border ${
              out || inCartQty === 0
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
            title="Quitar 1"
          >
            <Icon.Minus />
          </button>

          <div className="min-w-8 text-center text-sm">{inCartQty}</div>

          <button
            disabled={!canAdd}
            onClick={() => onInc(product.id, variant?.id ?? null)}
            className={`h-8 w-8 grid place-items-center rounded-full border ${
              !canAdd ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
            title="Agregar 1"
          >
            <Icon.Plus />
          </button>

          <button
            disabled={!canAdd}
            onClick={() => onAdd(product, variant)}
            className={`ml-auto px-3 h-8 rounded-xl text-sm text-white ${
              !canAdd ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-neutral-800"
            }`}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
