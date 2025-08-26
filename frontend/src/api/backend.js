// ----------------------------------------------
// 📦 backend.js
// 🔗 Axios apuntando al backend PHP
// ----------------------------------------------
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/SistemaDeInventario/backend',
  headers: { 'Content-Type': 'application/json' },
});

// 🎯 Interceptor para normalizar respuestas { success, data, error }
// Si viene { success:true, data:[...] }, devolvemos directamente el array en res.data
api.interceptors.response.use((res) => {
  const payload = res.data;
  if (payload && Array.isArray(payload.data)) {
    return { ...res, data: payload.data };
  }
  return res;
});

export default api;
