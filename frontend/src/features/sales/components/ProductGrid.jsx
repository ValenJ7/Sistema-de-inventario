import ProductCard from "./ProductCard";

export default function ProductGrid({ products, cart, onAdd, onInc, onDec }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((p) => {
        const inCart = cart.find((c) => c.product_id === p.id);
        return (
          <ProductCard
            key={p.id}
            product={p}
            inCartQty={inCart ? inCart.quantity : 0}
            onAdd={onAdd}
            onInc={onInc}
            onDec={onDec}
          />
        );
      })}

      {products.length === 0 && (
        <div className="col-span-full text-sm text-gray-500 border rounded-xl p-4 bg-white/60">
          No se encontraron productos para tu búsqueda.
        </div>
      )}
    </div>
  );
}
