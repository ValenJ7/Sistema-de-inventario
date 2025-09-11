import { Link } from "react-router-dom";
import { getImageUrl } from "../../../utils/getImageUrl"

export default function ProductCard({ product }) {
  return (
    <div className="border rounded-lg shadow hover:shadow-lg p-4">
      {product.image && (
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-48 object-cover mb-2 rounded"
        />
      )}
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-gray-600">${product.price}</p>
      <Link
        to={`/producto/${product.slug}`}
        className="text-blue-600 hover:underline mt-2 inline-block"
      >
        Ver detalle
      </Link>
    </div>
  );
}
