import { useState } from "react";
import ProductCard from "../components/ProductCard";
import { useProducts, useCategories } from "../hooks";

export default function Tienda() {
  // Estado para categoría y búsqueda
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Traemos productos con filtros (categoría + búsqueda)
  const { products, loading } = useProducts({
    ...(selectedCategory ? { category: selectedCategory } : {}),
    ...(searchTerm ? { q: searchTerm } : {}),
  });

  // Traemos todas las categorías
  const { categories, loading: loadingCategories } = useCategories();

  if (loading || loadingCategories) return <p>Cargando...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tienda</h1>

      {/* 🔹 Filtros responsivos */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full sm:flex-1"
        />

        {/* Select de categorías */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded px-3 py-2 w-full sm:w-auto"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 Listado de productos */}
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
