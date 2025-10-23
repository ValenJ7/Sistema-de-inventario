import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    // 🔐 Mismo patrón que en backend
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // === Validaciones Frontend ===
    if (!form.name || !form.email || !form.password) {
      toast.error("Por favor completá todos los campos");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.error("El email no tiene un formato válido");
      return;
    }

    if (!validatePassword(form.password)) {
      toast.error(
        "La contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, número y símbolo"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost/SistemaDeInventario/backend/auth/register.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al registrarse");
      }

      // Guardar token y usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Registro exitoso, bienvenido/a!");

      // Redirigir a la tienda
      navigate("/tienda");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-96 space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Crear cuenta</h2>

        <input
          type="text"
          name="name"
          placeholder="Nombre completo"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña segura"
          value={form.password}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>

        <p className="text-center text-sm text-gray-600">
          ¿Ya tenés una cuenta?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-black font-medium cursor-pointer hover:underline"
          >
            Iniciar sesión
          </span>
        </p>
      </form>
    </div>
  );
}
