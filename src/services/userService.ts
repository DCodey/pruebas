import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: any;
  token?: string;
}

export const userService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/check-user`,
        credentials
      );
      
      // Si la autenticación es exitosa, guardamos el token
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // La petición fue hecha y el servidor respondió con un status code
        // que no está en el rango de 2xx
        return error.response.data;
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        return {
          success: false,
          message: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.'
        };
      } else {
        // Algo pasó al configurar la petición que provocó un error
        return {
          success: false,
          message: 'Error al configurar la petición: ' + error.message
        };
      }
    }
  },

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  },

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  },

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

export default userService;
