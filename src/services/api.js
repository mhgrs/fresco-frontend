import axios from 'axios';

// Vite usa import.meta.env para leer variables de entorno.
// Si no existe (desarrollo local), usará el localhost por defecto.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: baseURL,
});

// ... resto de tu código de interceptores (tokens, etc.)
export default api;
