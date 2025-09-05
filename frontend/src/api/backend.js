// ----------------------------------------------
// 📦 backend.js (con default + named export)
// ----------------------------------------------
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/SistemaDeInventario/backend',
  headers: { 'Content-Type': 'application/json' },
});

// Normaliza { success, data:[...] } → res.data = array
api.interceptors.response.use((res) => {
  const payload = res.data;
  if (payload && Array.isArray(payload.data)) {
    return { ...res, data: payload.data };
  }
  return res;
});

// ⬇️ named export para subir imágenes (multipart)
export async function uploadProductImage(productId, file) {
  const form = new FormData();
  form.append('product_id', String(productId));
  form.append('image', file);

  const res = await api.post('/products/upload-image.php', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data; // { success, data: { id, url }, error }
}

// ⬇️ default export (lo que te está faltando)
export default api;
