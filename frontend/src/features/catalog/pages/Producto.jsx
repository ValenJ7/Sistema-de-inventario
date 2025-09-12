import { useParams } from "react-router-dom";
import { useProduct } from "../hooks";
import { getImageUrl } from "../../../utils/getImageUrl";

export default function Producto() {
  const { slug } = useParams();
  const { product, loading } = useProduct(slug);

  if (loading) return <p>Cargando producto...</p>;
  if (!product) return <p>Producto no encontrado</p>;

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🔹 Galería de imágenes */}
        <div>
          {product.images && product.images.length > 0 ? (
            <>
              {/* Imagen principal */}
              <img
                src={getImageUrl(product.images[0].url)}
                alt={product.name}
                className="w-full h-64 md:h-96 object-cover rounded mb-4"
              />

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img) => (
                  <img
                    key={img.id}
                    src={getImageUrl(img.url)}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500">Sin imágenes disponibles</p>
          )}
        </div>

        {/* 🔹 Información del producto */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600 text-lg mb-2">Precio: ${product.price}</p>
            <p className="text-gray-600 mb-4">Stock: {product.stock}</p>
          </div>

          {/* Botón de acción */}
          <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 w-full sm:w-auto">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
