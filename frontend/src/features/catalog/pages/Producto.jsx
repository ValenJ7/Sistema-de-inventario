import { useParams } from "react-router-dom";
import { useProduct } from "../hooks/useCatalog";
import { getImageUrl } from "../../../utils/getImageUrl";

export default function Producto() {
  const { slug } = useParams();
  const { product, loading } = useProduct(slug);

  if (loading) return <p>Cargando producto...</p>;
  if (!product) return <p>Producto no encontrado</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      <p className="text-gray-600 mb-2">Precio: ${product.price}</p>
      <p className="text-gray-600 mb-4">Stock: {product.stock}</p>

      {product.images && product.images.length > 0 && (
        <div className="flex gap-2">
          {product.images.map((img) => (
            <img
                key={img.id}
                src={getImageUrl(img.url)}
                alt={product.name}
                className="w-32 h-32 object-cover rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
}
