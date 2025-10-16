import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { getImageUrl } from "../../../utils/getImageUrl";

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);

  // Normalizo imágenes: uso images[] si existe; si no, armo el array con image/main_image
  const images = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    const fallback = product.image || product.main_image || product.image_url || null;
    return fallback ? [{ id: "main", url: fallback, is_main: 1 }] : [];
  }, [product]);

  const mainImage = images[0]?.url || null;
  const secondImage = images[1]?.url || null;

  // Sin stock: si hay variantes, todos en 0; sino, stock del producto
  const isOutOfStock = useMemo(() => {
    const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
    if (hasVariants) return product.variants.every(v => (v?.stock ?? 0) <= 0);
    return (product?.stock ?? 0) <= 0;
  }, [product]);

  return (
    <Link
      to={`/producto/${product.slug}`}
      className="group block rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Imagen */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {mainImage ? (
          <img
            src={getImageUrl(hovered && secondImage ? secondImage : mainImage)}
            alt={product.name}
            loading="lazy"
            draggable={false}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              hovered ? "scale-105" : "scale-100"
            }`}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 animate-pulse" />
        )}

        {/* Etiqueta SIN STOCK (no tapa toda la imagen) */}
        {isOutOfStock && (
          <div className="absolute top-2 left-2 bg-gray-900/75 text-white text-xs px-2 py-1 rounded-md">
            SIN STOCK
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 text-center">
        <h3 className="text-sm md:text-base font-medium text-gray-800 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-gray-700 font-semibold mt-1">
          ${Number(product.price).toLocaleString("es-AR")}
        </p>
      </div>
    </Link>
  );
}
