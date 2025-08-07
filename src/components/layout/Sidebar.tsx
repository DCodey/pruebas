import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline';


const navigation = [
    {name: 'Resumen ', href: '/resumen', icon: '📊'},
    { name: 'Ventas', href: '/ventas', icon: '💵' },
    { name: 'Clientes', href: '/clientes', icon: '👥' },
    { name: 'Productos', href: '/productos', icon: '📦' },
];

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
    const location = useLocation();

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
            <div className="flex-1 flex flex-col min-h-0 border-2 border-gray-100 m-2 bg-secondary-50 shadow-lg rounded-2xl h-screen overflow-y-auto">
                <div className="flex-1 flex flex-col px-4 py-2 overflow-y-auto">
                    <div className="flex items-center  border-b py-2 justify-center align-center">
                        <h1 className="text-primary-800 text-xl font-bold">Florería La Fontana</h1>
                    </div>
                    <nav className="mt-5 flex-1 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
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
                <div className="flex p-2">
                    <div className="w-full">
                        <button
                            onClick={onLogout}
                            className="ml-3 text-primary-600 text-sm font-medium hover:text-primary-800 p-2 rounded-lg"
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
    );
}
