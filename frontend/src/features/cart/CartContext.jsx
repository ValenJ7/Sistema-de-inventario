import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { cartReducer, initialCartState, cartKey } from "./cartReducer";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const [isReady, setIsReady] = useState(false);

  // Leer carrito desde localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(cartKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: "INIT", payload: parsed });
      }
    } catch (e) {
      console.warn("No se pudo leer el carrito:", e);
    } finally {
      setIsReady(true);
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    if (!isReady) return;
    try {
      localStorage.setItem(cartKey, JSON.stringify(state));
    } catch (e) {
      console.warn("No se pudo guardar el carrito:", e);
    }
  }, [state, isReady]);

  const totals = useMemo(() => {
    const items = Object.values(state.items);
    const count = items.reduce((a, it) => a + it.qty, 0);
    const subtotal = items.reduce((a, it) => a + it.qty * it.price, 0);
    return { count, subtotal };
  }, [state.items]);

  const api = useMemo(
    () => ({
      items: state.items,
      ...totals,
      addItem: (product, { qty = 1, variant = null, stock } = {}) =>
        dispatch({ type: "ADD", payload: { product, qty, variant, stock } }),
      setQty: (id, variant, qty) => dispatch({ type: "SET_QTY", payload: { id, variant, qty } }),
      inc: (id, variant) => dispatch({ type: "INC", payload: { id, variant } }),
      dec: (id, variant) => dispatch({ type: "DEC", payload: { id, variant } }),
      remove: (id, variant) => dispatch({ type: "REMOVE", payload: { id, variant } }),
      clear: () => dispatch({ type: "CLEAR" }),
    }),
    [state.items, totals]
  );

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext debe usarse dentro de <CartProvider>");
  return ctx;
};
