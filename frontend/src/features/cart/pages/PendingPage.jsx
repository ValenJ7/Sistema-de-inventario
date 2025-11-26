import { Link } from "react-router-dom";

export default function PendingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h1 className="text-3xl font-bold text-yellow-500 mb-4">
        ⏳ Pago pendiente
      </h1>
      <p className="text-lg text-gray-700 mb-6 text-center">
        Tu pago está en revisión.  
        Te notificaremos cuando MercadoPago confirme la operación.
      </p>

      <Link
        to="/tienda"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-800"
      >
        Volver a la tienda
      </Link>
    </div>
  );
}
