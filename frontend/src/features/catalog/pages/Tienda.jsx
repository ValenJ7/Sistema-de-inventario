import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useCatalog";

export default function Tienda() {
  const { products, loading } = useProducts();

  if (loading) return <p>Cargando productos...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tienda</h1>
      {products.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
