export function getImageUrl(path) {
  if (!path) return null;
  return `${import.meta.env.VITE_API_URL}${path}`;
}
