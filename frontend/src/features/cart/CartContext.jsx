import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { cartReducer, initialCartState, cartKey } from "./cartReducer";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const [isReady, setIsReady] = useState(false);

  // 🔹 Leer carrito desde localStorage al iniciar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(cartKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Evita casos de estructuras vacías o corruptas
        if (parsed && parsed.items && typeof parsed.items === "object") {
          dispatch({ type: "INIT", payload: parsed });
        }
      }
    } catch (e) {
      console.warn("⚠️ No se pudo leer el carrito:", e);
    } finally {
      setIsReady(true);
    }
  }, []);

  // 🔹 Guardar carrito en localStorage al cambiar
  useEffect(() => {
    if (!isReady) return;
    try {
      const data = JSON.stringify(state);
      if (Object.keys(state.items).length > 0) {
        localStorage.setItem(cartKey, data);
      } else {
        localStorage.removeItem(cartKey); // Limpia si está vacío
      }
    } catch (e) {
      console.warn("⚠️ No se pudo guardar el carrito:", e);
    }
  }, [state, isReady]);

  // 🔹 Totales: cantidad y subtotal
  const totals = useMemo(() => {
    const items = Object.values(state.items);
    const count = items.reduce((a, it) => a + it.qty, 0);
    const subtotal = items.reduce((a, it) => a + it.qty * it.price, 0);
    return { count, subtotal };
  }, [state.items]);

  // 🔹 API pública del carrito
  const api = useMemo(
    () => ({
      items: state.items,
      ...totals,
      isReady,
      addItem: (product, { qty = 1, variant = null, stock } = {}) =>
        dispatch({ type: "ADD", payload: { product, qty, variant, stock } }),
      setQty: (id, variant, qty) =>
        dispatch({ type: "SET_QTY", payload: { id, variant, qty } }),
      inc: (id, variant) => dispatch({ type: "INC", payload: { id, variant } }),
      dec: (id, variant) => dispatch({ type: "DEC", payload: { id, variant } }),
      remove: (id, variant) => dispatch({ type: "REMOVE", payload: { id, variant } }),
      clear: () => dispatch({ type: "CLEAR" }),
    }),
    [state.items, totals, isReady]
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext debe usarse dentro de <CartProvider>");
  return ctx;
};
