import { Link } from "react-router-dom";

export default function FailurePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h1 className="text-3xl font-bold text-red-600 mb-4">
        ❌ Pago fallido
      </h1>
      <p className="text-lg text-gray-700 mb-6 text-center">
        No pudimos procesar tu pago.  
        Por favor, intentá nuevamente.
      </p>

      <Link
        to="/checkout"
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
      >
        Volver al checkout
      </Link>
    </div>
  );
}
