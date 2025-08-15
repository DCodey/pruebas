import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ROUTES } from '../../routes/paths';

export default function ProtectedRoute() {
  const location = useLocation();
  const [tokenExists, setTokenExists] = useState<boolean | null>(null); // null = aún no verificado

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      setTokenExists(!!token);
    }
  }, []);

  // Mientras verificamos si hay token, no renderizamos nada
  if (tokenExists === null) {
    return null;
  }

  // Si no hay token, redirigir al login
  if (!tokenExists) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Token presente, permitir acceso
  return <Outlet />;
}
