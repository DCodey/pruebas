import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftStartOnRectangleIcon, 
  ChevronDownIcon, 
  ChevronRightIcon,
} from '@heroicons/react/24/solid';
import { ROUTES } from '../../routes/paths';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useCompany } from '../../contexts/CompanyContext';
import { PERMISSIONS } from 'src/utils/permissions';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

// Tipos para la navegación
interface NavItemBase {
  name: string;
  href?: string;
  icon: React.ReactNode;
  permission?: string;
  items?: NavItem[];
}

interface NavGroup extends NavItemBase {
  group: string;
  items: NavItem[];
}

type NavItem = NavItemBase | NavGroup;

const navigation: NavItem[] = [
  // Elementos individuales
  { 
    name: 'Resumen', 
    href: ROUTES.RESUMEN.path, 
    icon: '📊',
    permission: ROUTES.RESUMEN.permission
  },
  { 
    name: 'Ventas', 
    href: ROUTES.VENTAS.path, 
    icon: '🛒',
    permission: ROUTES.VENTAS.permission 
  },
  {
    name: 'Clientes', 
    href: ROUTES.CLIENTES.path, 
    icon: '👥',
    permission: ROUTES.CLIENTES.permission 
  },
  {
    name: 'Productos', 
    href: ROUTES.PRODUCTOS.path, 
    icon: '📦',
    permission: ROUTES.PRODUCTOS.permission 
  },
  {
    name: 'Servicios Especiales', 
    href: ROUTES.SERVICIOS_ESPECIALES.path, 
    icon: '💼',
    permission: ROUTES.SERVICIOS_ESPECIALES.permission 
  },
    
  // Grupo de Administración
  {
    name: 'Administración',
    group: 'Administración',
    icon: '🧑‍💻',
    items: [
      { 
        name: 'Usuarios', 
        href: ROUTES.USUARIOS.path, 
        icon: '👥',
        permission: ROUTES.USUARIOS.permission 
      },
      {
        name: 'Roles', 
        href: ROUTES.ROLES.path, 
        icon: '🧙‍♀️',
        permission: ROUTES.ROLES.permission 
      },
      { 
        name: 'Gestión de Permisos', 
        href: ROUTES.ASIGNAR_PERMISOS.path, 
        icon: '🔒',
        permission: ROUTES.ASIGNAR_PERMISOS.permission 
      },
      { 
        name: 'Configuración', 
        href: ROUTES.CONFIGURACION.path, 
        icon: '⚙️', 
        permission: ROUTES.CONFIGURACION.permission 
      },
    ]
  }
];

interface NavItemProps {
  item: NavItem;
  level?: number;
  onItemClick: () => void;
  permissions?: string[];
}

const NavItem = ({ item, level = 0, onItemClick, permissions = [] }: NavItemProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasChildren = item.items && item.items.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = item.href ? location.pathname === item.href : false;
  
  // Verificar si el usuario tiene permiso para ver este ítem
  if (item.permission && !permissions.includes(item.permission)) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    } else if (item.href) {
      onItemClick();
      navigate(item.href);
    }
  };

  return (
    <div className="space-y-1">
      <div
        onClick={handleClick}
        className={clsx(
          'flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer',
          'transition-colors duration-200',
          isActive
            ? 'bg-yellow-200 text-primary-700'
            : 'text-gray-700 hover:bg-gray-200 hover:text-primary-700',
          level > 0 ? `pl-${4 + level * 4}` : ''
        )}
      >
        <div className="flex items-center flex-1">
          <span className={clsx('mr-3 text-md')}>
            {item.icon}
          </span>
          <span className="flex-1 text-md text-primary-700">{item.name}</span>
          {hasChildren && (
            <span className="ml-2">
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </span>
          )}
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {item.items?.map((child) => (
            <NavItem 
              key={`${item.name}-${child.name}`}
              item={child}
              level={level + 1}
              onItemClick={onItemClick}
              permissions={permissions}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function Sidebar({ isOpen, onToggle, onLogout }: SidebarProps) {
  const permissions = usePermissions();
  const { data: company } = useCompany();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  // Inicializar grupos abiertos
  useEffect(() => {
    const { pathname } = location;
  
    const initialOpenState = navigation.reduce((acc, item) => {
      if ('group' in item) {
        const hasActiveChild = item.items.some(subItem => subItem.href === pathname);
        acc[item.group] = hasActiveChild; // ✅ Solo abre si tiene un subitem activo
      }
      return acc;
    }, {} as Record<string, boolean>);
  
    setOpenGroups(initialOpenState);
  }, [location]);

  // Cerrar el menú al hacer clic en un enlace (solo en móvil)
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  // Filtrar elementos de navegación según los permisos
  const filteredNavigation = navigation.filter(item => {
    // Si es un grupo, filtrar sus items
    if ('group' in item) {
      const filteredItems = item.items.filter(
        subItem => !subItem.permission || permissions.includes(subItem.permission)
      );
      return filteredItems.length > 0;
    }
    // Si es un ítem individual, verificar sus permisos
    return !item.permission || permissions.includes(item.permission);
  });

  return (
    <>
      {/* Overlay para móvil */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-25 z-30 transition-opacity md:hidden ${
          isOpen ? 'block' : 'hidden'
        }`}
        onClick={onToggle}
      />

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:flex md:w-72 h-screen`}
      >
        <div className="relative flex-1 flex flex-col border border-gray-100 md:m-2 bg-[url('/fondo.jpg')] bg-cover bg-center bg-no-repeat shadow-lg md:rounded-2xl h-screen">
          <div className="absolute inset-0 bg-white/70 md:rounded-2xl z-0" />
          {/* Header */}
          <div className="z-10 flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h1 className="text-primary-800 text-xl font-bold flex items-center gap-2">
              <span className="text-primary-800 text-xl font-bold">
                <img src="/flower2.png" alt="flower2.png" className="w-6 h-6" />
              </span>
              {company?.app_name || ''}</h1>
            <button
              onClick={onToggle}
              className="md:hidden text-gray-500 hover:text-gray-700 pl-2 rounded-full bg-secondary-50"
            >
              ✕
            </button>
          </div>

          {/* Navegación */}
          <div className="flex-1 flex flex-col overflow-y-auto py-4 z-10">
            <nav className="flex-1 space-y-2 px-3">
              {filteredNavigation.map((item) => {
                // Si es un grupo
                if ('group' in item) {
                  return (
                    <div key={item.group} className="space-y-1">
                      <button
                        onClick={() => toggleGroup(item.group)}
                        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
                      >
                        <div className="flex items-center">
                          <span className="mr-3 text-gray-500">
                            {item.icon}
                          </span>
                          <span>{item.group}</span>
                        </div>
                        {openGroups[item.group] ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </button>
                      
                      {openGroups[item.group] && (
                        <div className="mt-1 space-y-1 text-primary-600 text-md">
                          {item.items.map((subItem) => (
                            <NavItem 
                              key={`${item.group}-${subItem.name}`}
                              item={subItem}
                              onItemClick={handleNavClick}
                              permissions={permissions}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                
                // Si es un ítem individual
                return (
                  <NavItem 
                    key={item.name}
                    item={item}
                    onItemClick={handleNavClick}
                    permissions={permissions}
                  />
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="z-10 flex p-2 pb-14 md:pb-4">
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