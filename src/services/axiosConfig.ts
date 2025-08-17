import axios from 'axios';
import { userService } from './userService';
import { ROUTES } from '../routes/paths';

// ✅ Usa Vite para acceder a variables de entorno
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Asegúrate de que esté definida en tu .env
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor para añadir el token a cada solicitud si está presente
api.interceptors.request.use(
  (config) => {
    const token = userService.getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Interceptor para manejar errores de respuesta globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores 401 (token inválido o expirado)
    if (error.response?.status === 401) {
      console.warn('Token expirado o no autorizado. Cerrando sesión...');
      userService.logout();
      window.location.href = ROUTES.LOGIN;
    }

    // Puedes manejar otros códigos de error aquí si quieres
    return Promise.reject(error);
  }
);

export default api;
