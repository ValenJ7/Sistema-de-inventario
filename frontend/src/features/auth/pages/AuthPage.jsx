import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      toast.success("Sesión iniciada correctamente");

      if (user.role === "admin") {
        navigate("/");
      } else {
        navigate("/tienda");
      }
    } catch (err) {
      toast.error(err.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-lg overflow-hidden max-w-5xl w-full">
        {/* 🔹 Columna Izquierda: Login */}
        <div className="p-8 border-r border-gray-200">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            Ya tengo una cuenta
          </h2>
          <p className="text-gray-600 mb-6">
            Para iniciar sesión ingresa tu email y contraseña.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="Ej. nombre@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
              <div className="text-right mt-1">
                <a href="#" className="text-sm text-gray-500 hover:underline">
                  Olvidé mi contraseña
                </a>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Inicia sesión con tu usuario:
            </p>
            <div className="flex justify-center gap-4">
              <button className="w-10 h-10 rounded-full bg-white border shadow hover:bg-gray-100 flex items-center justify-center">
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                  alt="Google"
                  className="w-6 h-6"
                />
              </button>
              <button className="w-10 h-10 rounded-full bg-white border shadow hover:bg-gray-100 flex items-center justify-center">
                <img
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg"
                  alt="Facebook"
                  className="w-6 h-6"
                />
              </button>
            </div>
          </div>
        </div>

        {/* 🔹 Columna Derecha: Crear cuenta */}
        <div className="p-8 flex flex-col justify-center bg-gray-50">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Crear cuenta
          </h2>
          <p className="text-gray-600 mb-6">
            Crea una y aprovecha los beneficios:
          </p>
          <ul className="text-gray-700 mb-8 space-y-2 list-disc list-inside">
            <li>Realiza tus compras de manera más ágil.</li>
            <li>Guarda múltiples direcciones de envío y facturación.</li>
            <li>Revisa el estado de tus pedidos y compras.</li>
            <li>Haz una lista de tus productos favoritos.</li>
          </ul>

          <button
            onClick={() => navigate("/register")}
            className="bg-black text-white py-2 rounded hover:bg-gray-800 transition w-40 mx-auto"
          >
            Crear cuenta
          </button>
        </div>
      </div>
    </div>
  );
}
