import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon as MenuIcon } from '@heroicons/react/24/outline';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768; // md breakpoint
      setIsMobile(isMobileView);

      // En móvil, el sidebar empieza cerrado; en desktop, empieza abierto
      setSidebarOpen(!isMobileView);
    };

    // Configuración inicial
    handleResize();

    // Manejar cambios de tamaño de pantalla
    window.addEventListener('resize', handleResize);

    // Limpiar el event listener al desmontar
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/inicio_sesion');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onLogout={handleLogout}
      />

      {/* Contenido principal */}
      <div className="md:pl-72 md:pt-3 pr-2">

        {/* Barra superior en móvil */}
        <div className="md:hidden bg-white shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 focus:outline-none"
              onClick={toggleSidebar}
              aria-label="Abrir menú"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <main id="main-content" className="bg-white md:rounded-2xl w-full h-screen bg-white p-4 shadow-sm">
          <div className=" ">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
