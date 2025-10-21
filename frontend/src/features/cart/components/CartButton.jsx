import useCart from "../useCart";

export default function CartButton({ onClick }) {
  const { count } = useCart();

  return (
    <button
      onClick={onClick}
      aria-label="Abrir carrito"
      className="relative text-gray-800 hover:text-black transition-colors"
    >
      🛒
      {count > 0 && (
        <span
          className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          style={{ fontSize: "11px" }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
