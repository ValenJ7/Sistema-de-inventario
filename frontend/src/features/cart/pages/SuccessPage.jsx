import { Link } from "react-router-dom";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        ¡Pago exitoso! 🎉
      </h1>
      <p className="text-lg text-gray-700 mb-6 text-center">
        Tu compra fue procesada correctamente.  
        Te enviaremos un email cuando tu pedido esté listo para enviarse.
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
