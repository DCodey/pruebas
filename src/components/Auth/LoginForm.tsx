import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ROUTES } from '../../routes/paths';
import { PERMISSIONS } from '../../utils/permissions';

// Función para encontrar el primer módulo accesible basado en los permisos
const getFirstAccessibleRoute = (permissions: string[]): string => {
  // Orden de prioridad de las rutas
  const routePriority = [
    { path: ROUTES.RESUMEN.path, permission: ROUTES.RESUMEN.permission },
    { path: ROUTES.VENTAS.path, permission: ROUTES.VENTAS.permission },
    { path: ROUTES.CLIENTES.path, permission: ROUTES.CLIENTES.permission },
    { path: ROUTES.PRODUCTOS.path, permission: ROUTES.PRODUCTOS.permission },
    { path: ROUTES.SERVICIOS_ESPECIALES.path, permission: ROUTES.SERVICIOS_ESPECIALES.permission },
    { path: ROUTES.USUARIOS.path, permission: ROUTES.USUARIOS.permission },
    { path: ROUTES.ASIGNAR_PERMISOS.path, permission: ROUTES.ASIGNAR_PERMISOS.permission },
    { path: ROUTES.CONFIGURACION.path, permission: ROUTES.CONFIGURACION.permission },
  ];

  // Encontrar la primera ruta para la que el usuario tenga permiso
  const accessibleRoute = routePriority.find(route => 
    permissions.includes(route.permission)
  );

  // Si no se encuentra ninguna ruta accesible, redirigir a una ruta por defecto
  return accessibleRoute?.path || ROUTES.RESUMEN.path;
};

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
  
    try {
      if (isLogin) {
        const response = await login(email, password);
  
        if (!response.success) {
          setError(response.message || 'Error al iniciar sesión');
          return;
        }
  
      } else {
        const response = await signup(email, password);
  
        if (!response.success) {
          setError(response.message || 'Error al crear cuenta');
          return;
        }
      }
  
      // Obtener permisos del usuario
      const userPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
      // Redirigir al primer módulo accesible
      const firstAccessibleRoute = getFirstAccessibleRoute(userPermissions);
      navigate(firstAccessibleRoute, { replace: true });
  
    } catch (err) {
      setError('Error inesperado');
      console.error(err);
    }
  }
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Inicio de sesión' : 'Registrarse'}
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="text"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 focus:outline-none"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <Button 
              type="submit" 
              variant="primary"
              fullWidth
              className="py-2"
            >
              {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </Button>
          </div>
        </form>
        {/* <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div> */}
      </div>
    </div>
  );
}
