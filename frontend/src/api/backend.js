import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Debe terminar en /backend/
  // NO fijes Content-Type global; lo seteamos por request
});

// Si querés “desenvolver” {success,data:[...]}, mantené esto robusto:
api.interceptors.response.use((res) => {
  const payload = res?.data;
  if (payload && Array.isArray(payload.data)) {
    return { ...res, data: payload.data };
  }
  return res;
});

// SUGERENCIA: setear JSON sólo cuando el body NO es FormData
api.interceptors.request.use((config) => {
  const isForm = (config.data instanceof FormData);
  if (!isForm) {
    config.headers = {
      ...(config.headers || {}),
      'Content-Type': 'application/json',
    };
  }
  return config;
});

export async function uploadProductImage(productId, file) {
  try {
    const form = new FormData();
    form.append('product_id', String(productId));
    form.append('image', file);

    // Ruta SIN "/" inicial y con /admin/
    const res = await api.post('admin/products/upload-image.php', form);
    // NO pongas Content-Type a mano: el navegador agrega el boundary

    const payload = res?.data;
    return {
      success: !!payload?.success,
      data: payload?.data ?? null,
      error: payload?.error ?? null,
    };
  } catch (e) {
    const serverMsg =
      e?.response?.data?.error ||
      e?.response?.data?.message ||
      e?.message ||
      'Error de red';
    return { success: false, data: null, error: serverMsg };
  }
}

export default api;
