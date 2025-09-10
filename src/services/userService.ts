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

export interface User {
  id: string;
  name: string;
  email: string;
  role:string;
  password?: string;
}

export async function addUser(user: Partial<User>): Promise<User> {
  const token = localStorage.getItem('authToken');
  const response = await axios.post(`${API_URL}/users`, user, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}

export async function updateUser(user: User): Promise<User> {
  const token = localStorage.getItem('authToken');
  const response = await axios.put(`${API_URL}/users/${user.id}`, user, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}

export async function deleteUser(id: string): Promise<void> {
  const token = localStorage.getItem('authToken');
  await axios.delete(`${API_URL}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export const getUsers = async (): Promise<User[]> => {
  const token = localStorage.getItem('authToken');
  const response = await axios.get(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data || [];
}

export const getUserById = async (id: string): Promise<User> => {
  const token = localStorage.getItem('authToken');
  const response = await axios.get(`${API_URL}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.data;
}

export const userService = {
  async getUserPermissions(userId: number): Promise<any> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/user/${userId}/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Error al consultar permisos del usuario',
        data: null
      };
    }
  },

  async setUserPermissions(userId: number, permissions: string[]): Promise<any> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`${API_URL}/user/${userId}/permissions`, { permissions }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Error al actualizar permisos',
        data: null
      };
    }
  },
  async getPermissions(): Promise<any> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/user/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Error al consultar permisos',
        data: null
      };
    }
  },
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
