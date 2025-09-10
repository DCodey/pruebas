import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ResumenPage from '../app/routes/resumen';
import Ventas from '../app/routes/ventas';
import Clientes from '../app/routes/clientes';
import Productos from '../app/routes/productos';
import ServiciosEspeciales from '../app/routes/servicios-especiales';
import Configuracion from '../app/routes/Configuracion';
import LoginPage from '../app/routes/inicio_sesion';
import NotFound from '../app/routes/not-found';
import AssignPermissionsPage from '../app/routes/gestion-permisos';
import Usuarios from '../app/routes/usuarios';
import Roles from '../app/routes/roles';
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { useAuth } from './contexts/AuthContext';
import { ROUTES } from './routes/paths';

export default function App() {
  return (
    <AuthProvider>
      <PermissionsConsumerWrapper>
        <AlertProvider>
          <Routes>
            <Route path="/" element={<Navigate to={ROUTES.LOGIN.path} replace />} />
            <Route path={ROUTES.LOGIN.path} element={<LoginPage />} />
            <Route path={ROUTES.RESUMEN.path} element={<ResumenPage />} />
            <Route path={ROUTES.VENTAS.path} element={<Ventas />} />
            <Route path={ROUTES.CLIENTES.path} element={<Clientes />} />
            <Route path={ROUTES.PRODUCTOS.path} element={<Productos />} />
            <Route path={ROUTES.SERVICIOS_ESPECIALES.path} element={<ServiciosEspeciales />} />
            <Route path={ROUTES.USUARIOS.path} element={<Usuarios />} />
            <Route path={ROUTES.ROLES.path} element={<Roles />} />
            <Route path={ROUTES.ASIGNAR_PERMISOS.path} element={<AssignPermissionsPage />} />
            <Route path={ROUTES.CONFIGURACION.path} element={<Configuracion />} />
            <Route path={ROUTES.NOT_FOUND.path} element={<NotFound />} />
          </Routes>
        </AlertProvider>
      </PermissionsConsumerWrapper>
    </AuthProvider>
  );
}

// ✅ Wrapper para consumir permisos del AuthContext y pasarlos al PermissionsProvider
function PermissionsConsumerWrapper({ children }: { children: React.ReactNode }) {
  const { permissions } = useAuth();
  return <PermissionsProvider permissions={permissions}>{children}</PermissionsProvider>;
}