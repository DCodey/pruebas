import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Loader from '../ui/Loader';
import Unauthorized from '../ui/Unauthorized';

export default function ProtectedRoute() {
  const [tokenExists, setTokenExists] = useState<boolean | null>(null); // null = aún no verificado

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      setTokenExists(!!token);
    }
  }, []);

  // Mientras verificamos si hay token, no renderizamos nada

  if (tokenExists === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader />
      </div>
    );
  }

  // Si no hay token, mostrar mensaje de no autorizado y botón para iniciar sesión
  if (!tokenExists) {
    return <Unauthorized />;
  }

  // Token presente, permitir acceso
  return <Outlet />;
}
