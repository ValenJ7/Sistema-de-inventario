import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useCart from "../useCart"; // 👈 IMPORTANTE

export default function ShippingPage() {
  const navigate = useNavigate();
  const { items, clear } = useCart(); // 👈 Leemos del contexto global
  const cart = Object.values(items);  // 👈 Convertimos a array

  const [form, setForm] = useState({
    address: "",
    city: "",
    province: "",
    postal_code: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    if (cart.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost/SistemaDeInventario/backend/orders/create.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: cart,
            ...form,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al crear el pedido");

      toast.success("Pedido creado correctamente");

      // Limpia el carrito
      clear();

      // Redirige al link de pago (por ahora simulado)
      window.location.href = data.mp_init_point;
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Información de Envío
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ciudad</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Provincia</label>
          <input
            type="text"
            name="province"
            value={form.province}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Código Postal
          </label>
          <input
            type="text"
            name="postal_code"
            value={form.postal_code}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Confirmar y continuar al pago
        </button>
      </form>
    </div>
  );
}
