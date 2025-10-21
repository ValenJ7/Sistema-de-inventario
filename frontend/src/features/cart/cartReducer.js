export const cartKey = "cart:v1";

export const initialCartState = {
  items: {},
  createdAt: Date.now(),
};

const getKey = (id, variant) => `${id}:${variant ?? "-"}`;

export function cartReducer(state, action) {
  switch (action.type) {
    case "INIT":
      return action.payload || state;
    case "ADD": {
      const { product, qty, variant, stock } = action.payload;
      const key = getKey(product.id, variant);
      const current = state.items[key] || {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        variant,
        qty: 0,
        stock,
        slug: product.slug,
      };
      const nextQty = Math.min((current.qty || 0) + qty, stock ?? Infinity);
      return { ...state, items: { ...state.items, [key]: { ...current, qty: nextQty } } };
    }
    case "SET_QTY": {
      const { id, variant, qty } = action.payload;
      const key = getKey(id, variant);
      const item = state.items[key];
      if (!item) return state;
      const newQty = Math.min(qty, item.stock ?? qty);
      return { ...state, items: { ...state.items, [key]: { ...item, qty: newQty } } };
    }
    case "INC": {
      const { id, variant } = action.payload;
      const key = getKey(id, variant);
      const item = state.items[key];
      if (!item) return state;
      const newQty = Math.min(item.qty + 1, item.stock ?? item.qty + 1);
      return { ...state, items: { ...state.items, [key]: { ...item, qty: newQty } } };
    }
    case "DEC": {
      const { id, variant } = action.payload;
      const key = getKey(id, variant);
      const item = state.items[key];
      if (!item) return state;
      const newQty = Math.max(1, item.qty - 1);
      return { ...state, items: { ...state.items, [key]: { ...item, qty: newQty } } };
    }
    case "REMOVE": {
      const { id, variant } = action.payload;
      const key = getKey(id, variant);
      const newItems = { ...state.items };
      delete newItems[key];
      return { ...state, items: newItems };
    }
    case "CLEAR":
      return { ...initialCartState, createdAt: Date.now() };
    default:
      return state;
  }
}
