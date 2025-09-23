export function money(n) {
  const v = Number(n ?? 0);
  return v.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  });
}
