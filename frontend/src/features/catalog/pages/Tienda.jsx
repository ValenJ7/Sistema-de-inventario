import { useOutletContext } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks";

export default function Tienda() {
  const { selectedCategory, searchTerm, categories } = useOutletContext();

  const { products, loading, hasMore, loadMore } = useProducts({
    ...(selectedCategory ? { category: selectedCategory } : {}),
    ...(searchTerm ? { q: searchTerm } : {}),
    size: 8,
  });

  // 🏷️ Buscar el nombre de la categoría actual
  const categoryName = selectedCategory
    ? categories.find((c) => c.id == selectedCategory)?.name
    : null;

  if (loading && products.length === 0) return <p>Cargando...</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {categoryName || "Tienda"}
      </h1>

      {products.length === 0 ? (
        <p className="text-gray-500 text-center">
          No hay productos disponibles.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Mostrar más"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
