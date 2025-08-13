import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { ROUTES } from '../../routes/paths';


const navigation = [
    { name: 'Resumen ', href: ROUTES.RESUMEN, icon: '📊' },
    { name: 'Ventas', href: ROUTES.VENTAS, icon: '💵' },
    { name: 'Clientes', href: ROUTES.CLIENTES, icon: '👥' },
    { name: 'Productos', href: ROUTES.PRODUCTOS, icon: '📦' },
    { name: 'Servicios Especiales', href: ROUTES.SERVICIOS_ESPECIALES, icon: '🛠️' },
];

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onLogout: () => void;
}

export function Sidebar({ isOpen, onToggle, onLogout }: SidebarProps) {
    const location = useLocation();

    // Cerrar el menú al hacer clic en un enlace (solo en móvil)
    const handleNavClick = () => {
        if (window.innerWidth < 768) { // md breakpoint
            onToggle();
        }
    };

    return (
        <>
            {/* Overlay para móvil */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-25 z-30 transition-opacity md:hidden ${
                    isOpen ? 'block' : 'hidden'
                }`}
                onClick={onToggle}
            ></div>

            {/* Sidebar */}
            <div id='sidebar' className={`fixed z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                } md:flex md:w-72 h-screen`}>
                <div className="flex-1 flex flex-col border-2 border-gray-100 md:m-2 bg-secondary-50 shadow-lg md:rounded-2xl h-screen">
                    {/* Header del Sidebar con botón de cerrar en móvil */}
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <h1 className="text-primary-800 text-xl font-bold">🌸Florería La Fontana</h1>
                        <button
                            onClick={onToggle}
                            className="md:hidden text-gray-500 hover:text-gray-700 pl-2 rounded-full bg-secondary-50"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Navegación */}
                    <div className="flex-1 flex flex-col px-4 py-2 overflow-y-auto">
                        <nav className="mt-5 flex-1 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={handleNavClick}
                                    className={`${location.pathname === item.href
                                        ? 'bg-primary-100 text-primary-600'
                                        : 'text-primary-600 hover:bg-primary-100'
                                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                                >
                                    <span className="mr-3 text-lg">{item.icon}</span>
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Pie del Sidebar */}
                    <div className="flex p-2 pb-14 md:pb-4">
                        <div className="w-full">
                            <button
                                onClick={onLogout}
                                className="ml-3 text-primary-600 text-sm font-medium hover:text-primary-800 p-2 rounded-lg w-full text-left"
                            >
                                <span className="flex items-center gap-2">
                                    <ArrowLeftStartOnRectangleIcon className="h-6 w-6" />
                                    Cerrar Sesión
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
