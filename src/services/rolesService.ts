import api from './axiosConfig';

// Definir los tipos de datos específicos para la API
interface ApiRole {
  id: string | number;
  name: string;
  permissions: Array<{
    id: number;
    name: string;
  }>;
}

// Interfaz para permisos en la aplicación
export interface Permission {
  id?: number | string;
  name: string;
  key?: string;  // Para compatibilidad con el sistema existente
  [key: string]: any;
}

// Interfaz para roles en la aplicación
export interface Role {
  id: string;  // Siempre string para compatibilidad con otros componentes
  name: string;
  permissions: (string | Permission)[];
  permissionsString?: string; // Para compatibilidad con el código existente
}

export const getRoles = async (): Promise<Role[]> => {
    const response = await api.get<{ success: boolean; data: ApiRole[] }>('/roles');
    const roles = response.data.data || [];
    
    // Convertir el formato de la API al formato esperado por la aplicación
    const formattedRoles = roles.map(role => {
      const formattedRole: Role = {
        id: String(role.id), // Asegurar que el ID sea un string
        name: role.name,
        permissions: role.permissions.map(p => ({
          id: p.id,
          name: p.name,
          key: p.name // Usar name como key para compatibilidad
        }))
      };
      
      // Añadir permissionsString para compatibilidad
      formattedRole.permissionsString = JSON.stringify(formattedRole.permissions.map(p => 
        typeof p === 'string' ? p : p.name
      ));
      
      return formattedRole;
    });    
    
    return formattedRoles;
}

export const addRole = async (roleName: string): Promise<Role> => {
    const response = await api.post<{ success: boolean; data: Role }>('/roles', { name: roleName });
    return response.data.data;
}

// Alias para mantener compatibilidad con el código existente
export const createRole = addRole;

export const updateRolePermissions = async (roleId: string, permissions: string[]): Promise<Role> => {
    const response = await api.patch<{ success: boolean; data: Role }>(`/roles/${roleId}/permissions`, {
        permissions
    });
    return response.data.data;
}

export const getRoleById = async (roleId: string): Promise<Role | null> => {
    try {
        const response = await api.get<{ success: boolean; data: ApiRole }>(`/roles/${roleId}`);
        const roleData = response.data.data;
        
        // Convertir el formato de la API al formato esperado por la aplicación
        const formattedRole: Role = {
            id: String(roleData.id),
            name: roleData.name,
            permissions: roleData.permissions.map(p => ({
                id: p.id,
                name: p.name,
                key: p.name // Usar name como key para compatibilidad
            })),
            permissionsString: JSON.stringify(roleData.permissions.map(p => p.name))
        };
        
        return formattedRole;
    } catch (error) {
      return null;
    }
}

export const updateRole = async (role: Role): Promise<Role> => {
    const response = await api.put<{ success: boolean; data: Role }>(`/roles/${role.id}`, role);
    return response.data.data;
}

export const deleteRole = async (roleId: string): Promise<{ message?: string }> => {
    const response = await api.delete(`/roles/${roleId}`);
    return { message: response.data?.message };
};
