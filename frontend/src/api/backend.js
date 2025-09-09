// api/backend.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/SistemaDeInventario/backend',
  headers: { 'Content-Type': 'application/json' },
});

// Manténe tu interceptor si querés
api.interceptors.response.use((res) => {
  const payload = res.data;
  if (payload && Array.isArray(payload.data)) {
    return { ...res, data: payload.data };
  }
  return res;
});

export async function uploadProductImage(productId, file) {
  try {
    const form = new FormData();
    form.append('product_id', String(productId));
    form.append('image', file);

    const res = await api.post('/products/upload-image.php', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // Si el PHP no manda JSON válido, res.data podría no ser objeto
    if (res && res.data && typeof res.data === 'object') {
      return {
        success: !!res.data.success,
        data: res.data.data ?? null,
        error: res.data.error ?? null,
      };
    }

    // Fallback si vino algo raro
    return { success: false, data: null, error: 'Respuesta no válida del servidor' };
  } catch (e) {
    // Axios error: intentar leer respuesta del server
    const serverMsg =
      e?.response?.data?.error ||
      e?.response?.data?.message ||
      e?.message ||
      'Error de red';
    return { success: false, data: null, error: serverMsg };
  }
}

export default api;
