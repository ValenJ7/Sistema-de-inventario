// src/features/sales/hooks/useSales.js
import { useMemo, useState, useCallback } from "react";

const keyFor = (pid, vid) => `${pid}-${(vid ?? 0)}`;

export function useSales(products = []) {
  const [cart, setCart] = useState({}); // { [key]: { key, product_id, variant_id, size, name, price, quantity } }

  const getProduct = (pid) => products.find(p => p.id === pid) || null;
  const getVariant = (product, variantId) =>
    (product?.variants || []).find(v => v.id === variantId) || null;

  const getAvailable = (product, variant) => {
    if (variant) return Number(variant.stock || 0); // stock del talle
    return Number(product?.stock_total ?? product?.stock ?? 0); // legacy sin variantes
  };

  const getQty = (pid, vid) => cart[keyFor(pid, vid)]?.quantity ?? 0;

  const addToCart = (product, variant = null) => {
    const pid = product.id;
    const vid = variant?.id ?? null;
    const key = keyFor(pid, vid);

    const current = cart[key]?.quantity ?? 0;
    const available = getAvailable(product, variant);

    if (current + 1 > available) return; // stock insuficiente

    setCart(prev => ({
      ...prev,
      [key]: {
        key,
        product_id: pid,
        variant_id: vid,
        size: variant?.label ?? null,
        name: product.name,
        price: Number(product.price),
        quantity: current + 1,
      },
    }));
  };

  const inc = (pid, vid = null) => {
    const product = getProduct(pid);
    const variant = getVariant(product, vid);
    const key = keyFor(pid, vid);

    const current = cart[key]?.quantity ?? 0;
    const available = getAvailable(product, variant);

    if (current + 1 > available) return; // stock insuficiente

    setCart(prev => ({
      ...prev,
      [key]: { ...prev[key], quantity: current + 1 },
    }));
  };

  const dec = (pid, vid = null) => {
    const key = keyFor(pid, vid);
    const current = cart[key]?.quantity ?? 0;

    if (current <= 1) {
      setCart(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    } else {
      setCart(prev => ({
        ...prev,
        [key]: { ...prev[key], quantity: current - 1 },
      }));
    }
  };

  const remove = (pid, vid = null) => {
    const key = keyFor(pid, vid);
    setCart(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const items = useMemo(() => Object.values(cart), [cart]);
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

  // === 🔥 NUEVO: crear venta en backend (igual que useProducts) ===
  const createSale = useCallback(async (items) => {
    try {
      const res = await fetch("http://localhost/SistemaDeInventario/backend/admin/sales/create.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        console.error("Error HTTP:", res.status);
        return { success: false, error: "HTTP " + res.status };
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error en createSale:", err);
      return { success: false, error: err.message || "Error desconocido" };
    }
  }, []);

  return { items, subtotal, getQty, addToCart, inc, dec, remove, createSale };
}

// para que puedas importar con o sin llaves
export default useSales;
