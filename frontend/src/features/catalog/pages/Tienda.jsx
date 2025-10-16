import { useState } from "react";
import ProductCard from "../components/ProductCard";
import { useProducts, useCategories } from "../hooks";

export default function Tienda() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { products, loading, hasMore, loadMore } = useProducts({
    ...(selectedCategory ? { category: selectedCategory } : {}),
    ...(searchTerm ? { q: searchTerm } : {}),
    size: 8,
  });

  const { categories, loading: loadingCategories } = useCategories();

  if (loading && products.length === 0) return <p>Cargando...</p>;
  if (loadingCategories) return <p>Cargando categorías...</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Tienda</h1>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full sm:flex-1"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full sm:w-auto"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grilla adaptativa */}
      {products.length === 0 ? (
        <p className="text-gray-500">No hay productos disponibles.</p>
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
