import ProductCard from "./ProductCard";

export default function ProductGrid({
  products = [],
  getQty = () => 0,          // (productId, variantId) => cantidad en carrito
  onAdd,                     // (product, variant) => void
  onInc,                     // (productId, variantId) => void
  onDec,                     // (productId, variantId) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          getQty={getQty}
          onAdd={onAdd}
          onInc={onInc}
          onDec={onDec}
        />
      ))}
    </div>
  );
}
