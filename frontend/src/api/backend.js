// ----------------------------------------------
// 📦 backend.js
// 🔗 Axios apuntando al backend PHP
// ----------------------------------------------
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/SistemaDeInventario/backend',
  headers: { 'Content-Type': 'application/json' },
});

export default api;
