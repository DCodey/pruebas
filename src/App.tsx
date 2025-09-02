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
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';

export default function App() {
  return (
 <AuthProvider>
      <AlertProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/inicio_sesion" replace />} />
          <Route path="/inicio_sesion" element={<LoginPage />} />
          <Route path="/resumen" element={<ResumenPage />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/servicios" element={<ServiciosEspeciales />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AlertProvider>
    </AuthProvider>
  );
}
