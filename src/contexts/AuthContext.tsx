import { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/userService';

interface AuthContextType {
  currentUser: any | null;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  // Sincronizar estado con localStorage al cargar la app
  useEffect(() => {
    const user = userService.getCurrentUser();
    setCurrentUser(user);
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
      }
  
    return response;
  };

  const logout = async () => {
    userService.logout();
    setCurrentUser(null);
    };
  const value: AuthContextType = {
    currentUser,
    signup,
    login,
    logout
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
