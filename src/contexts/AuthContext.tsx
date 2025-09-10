import { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';

interface AuthContextType {
  currentUser: any | null;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  permissions: string[];
  roles: string[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Sincronizar estado con localStorage al cargar la app
  useEffect(() => {
    const user = userService.getCurrentUser();
    setCurrentUser(user);
    // Cargar permisos y roles desde localStorage si existen
    const perms = localStorage.getItem('permissions');
    const rolesLS = localStorage.getItem('roles');
    if (perms) setPermissions(JSON.parse(perms));
    if (rolesLS) setRoles(JSON.parse(rolesLS));
    setLoading(false);
  }, []);

  const signup = (email: string, password: string) =>{
    //por ahora no hace nada
    return Promise.resolve();
  }

  const login = async (email: string, password: string) => {
    const response = await userService.login({ email, password });
    if (response.success) {
      setCurrentUser(response.user);
      // Consultar permisos tras login
      const permRes = await userService.getPermissions();
      if (permRes.success && permRes.data) {
        setPermissions(permRes.data.permissions);
        setRoles(permRes.data.roles);
        localStorage.setItem('permissions', JSON.stringify(permRes.data.permissions));
        localStorage.setItem('roles', JSON.stringify(permRes.data.roles));
      }
    }
    return response;
  };

  const logout = async () => {
    userService.logout();
    setCurrentUser(null);
    setPermissions([]);
    setRoles([]);
    localStorage.removeItem('permissions');
    localStorage.removeItem('roles');
  };
  const value: AuthContextType = {
    currentUser,
    signup,
    login,
    logout,
    permissions,
    roles
  };

  if (loading) {
    return null;
  }
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
