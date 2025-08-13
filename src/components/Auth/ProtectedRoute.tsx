import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../routes/paths';

export default function ProtectedRoute() {
  const { currentUser } = useAuth();
  const location = useLocation();

  console.log('🔥 ProtectedRoute montado en:', location.pathname);


  console.log('>> PROTECTED ROUTE', {
    path: location.pathname,
    user: currentUser,
  });

  //  Usuario no autenticado
  if (!currentUser) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // ✅ Usuario autenticado, muestra las rutas protegidas
  return <Outlet />;

}
