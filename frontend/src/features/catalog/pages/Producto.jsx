import { useParams } from "react-router-dom";
import { useProduct } from "../hooks";
import { useMemo, useState } from "react";
import { getImageUrl } from "../../../utils/getImageUrl";

// 🆕 import del hook del carrito
import useCart from "../../cart/useCart";

export default function Producto() {
  const { slug } = useParams();
  const { product, loading } = useProduct(slug);

  const [activeIdx, setActiveIdx] = useState(0);
  const [fade, setFade] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState("");

  const { addItem } = useCart(); // 🆕 del contexto del carrito

  const images = useMemo(() => product?.images ?? [], [product]);
  const variants = useMemo(() => product?.variants ?? [], [product]);
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) || null;

  const productOutOfStock = variants.length
    ? variants.every((v) => (v?.stock ?? 0) <= 0)
    : (product?.stock ?? 0) <= 0;

  const canAddToCart = selectedVariant
    ? (selectedVariant.stock ?? 0) > 0
    : (product?.stock ?? 0) > 0;

  const priceFormatted = Number(product?.price || 0).toLocaleString("es-AR");

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    // 🧩 Agregar producto al carrito
    const variantLabel = selectedVariant?.label || null;
    const stock = selectedVariant?.stock ?? product.stock ?? undefined;

    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: getImageUrl(images?.[0]?.url ?? ""),
        slug: product.slug,
      },
      { qty: quantity, variant: variantLabel, stock }
    );

    // 🟢 Mostrar toast corto (visual rápido)
    setToast("Producto agregado al carrito");
    setTimeout(() => setToast(""), 2000);

    // 🛒 Disparar apertura del carrito
    const evt = new CustomEvent("openCartDrawer");
    window.dispatchEvent(evt);
  };

  const handleThumbnailClick = (index) => {
    if (index === activeIdx) return;
    setFade(true);
    setTimeout(() => {
      setActiveIdx(index);
      setFade(false);
    }, 200);
  };

  if (loading)
    return <p className="p-6 text-gray-600">Cargando producto...</p>;
  if (!product)
    return <p className="p-6 text-gray-600">Producto no encontrado</p>;

  return (
    <div className="bg-[#FAFAFA] text-[#222] font-[Inter]">
      <div className="container mx-auto px-4 py-12 relative">
        {/* 🟢 Toast */}
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-md z-50">
            {toast}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[65fr_10fr_35fr] gap-8 items-start">
          {/* Imagen principal */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100">
            {images.length > 0 && (
              <img
                src={getImageUrl(images[activeIdx]?.url)}
                alt={product.name}
                draggable={false}
                className={`w-full h-full object-cover transition-all duration-500 ease-out cursor-zoom-in ${
                  fade ? "opacity-0 scale-105" : "opacity-100 scale-100"
                }`}
              />
            )}
          </div>

          {/* Miniaturas verticales */}
          {images.length > 1 && (
            <div className="hidden lg:flex flex-col gap-2 sticky top-24 items-start">
              {images.map((img, idx) => (
                <button
                  key={img.id ?? idx}
                  onClick={() => handleThumbnailClick(idx)}
                  className={`border rounded-md overflow-hidden transition-all duration-200 hover:border-gray-800 ${
                    activeIdx === idx
                      ? "border-gray-800 ring-1 ring-gray-800"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={getImageUrl(img.url)}
                    alt=""
                    className="object-cover w-20 h-20"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Panel derecho */}
          <div className="flex flex-col gap-8 pt-4">
            {/* Info básica */}
            <div>
              <h1 className="text-[28px] font-light tracking-wide uppercase text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-xl font-semibold text-gray-800 mb-1">
                ${priceFormatted}
              </p>
              {selectedVariant ? (
                <p className="text-sm text-gray-500">
                  Stock talle {selectedVariant.label}: {selectedVariant.stock}
                </p>
              ) : (
                <p className="text-sm text-gray-500">
                  {variants.length
                    ? "Elegí un talle"
                    : `Stock: ${product.stock}`}
                </p>
              )}
            </div>

            {/* Selector de talle */}
            {variants.length > 0 && (
              <div>
                <p className="text-xs uppercase text-gray-500 tracking-wider mb-3">
                  Talle
                </p>
                <div className="flex flex-wrap gap-3">
                  {variants.map((v) => {
                    const disabled = (v.stock ?? 0) <= 0;
                    const selected = selectedVariantId === v.id;
                    return (
                      <button
                        key={v.id}
                        disabled={disabled}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-5 py-2 rounded-full border text-sm transition-all duration-200
                          ${
                            selected
                              ? "border-gray-800 bg-gray-900 text-white"
                              : "border-gray-300 bg-transparent text-gray-800 hover:border-gray-800"
                          }
                          ${disabled ? "opacity-40 cursor-not-allowed" : ""}
                        `}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selector de cantidad */}
            <div>
              <p className="text-xs uppercase text-gray-500 tracking-wider mb-3">
                Cantidad
              </p>
              <div className="flex items-center border border-gray-300 w-fit rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 hover:bg-gray-100 text-lg font-semibold"
                >
                  −
                </button>
                <span className="px-5 text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-2 hover:bg-gray-100 text-lg font-semibold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Botón agregar */}
            <div className="pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`w-full px-8 py-4 rounded-full text-sm font-semibold uppercase tracking-widest transition-all duration-300
                  ${
                    canAddToCart
                      ? "bg-black text-white hover:bg-[#222]"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
              >
                Agregar al carrito
              </button>
            </div>

            {/* Descripción / Detalles */}
            <div className="border-t border-gray-200 pt-6">
              {/* … tu bloque de detalles igual … */}
            </div>
          </div>
        </div>

        {/* Mobile: galería horizontal */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 lg:hidden overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={img.id ?? idx}
                onClick={() => handleThumbnailClick(idx)}
                className={`border rounded-md overflow-hidden flex-shrink-0 transition-all duration-200 ${
                  activeIdx === idx ? "border-gray-800" : "border-gray-200"
                }`}
              >
                <img
                  src={getImageUrl(img.url)}
                  alt=""
                  className="object-cover w-20 h-20"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
