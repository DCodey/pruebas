import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../ui/Loader';

export default function ProtectedRoute() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  console.log('>> PROTECTED ROUTE', {
    path: location.pathname,
    user: currentUser,
    loading: loading
  });
  if (loading) {
    return <Loader />; 
  }

  // Si no hay usuario autenticado, redirigir a la página de inicio de sesión
  if (!currentUser) {
    
    //Evitar bucles asegurándonos de que no estamos ya en la página de inicio de sesión
    if (location.pathname !== '/inicio_sesion') {
      console.log('🔒 Redirigiendo a inicio de sesión desde:', location.pathname);
      return (
        <Navigate 
          to="/inicio_sesion" 
          state={{ 
            from: location.pathname,
            message: 'Por favor inicia sesión para acceder a esta página'
          }} 
          replace 
        />
      );
    }
    // Si ya estamos en la página de inicio de sesión, no redirigir
    return <Outlet />;
  }

  // Si el usuario está autenticado pero está en la página de inicio de sesión, redirigir a la página principal
  if (location.pathname === '/inicio_sesion') {
    console.log('🔑 Usuario autenticado, redirigiendo a /clientes');
    return <Navigate to="/clientes" replace />;
  }

  // Usuario autenticado, mostrar el contenido protegido
  return <Outlet />;
}
