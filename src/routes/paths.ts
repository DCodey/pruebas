import { PERMISSIONS } from 'src/utils/permissions';

export const ROUTES = {
  LOGIN: {
    path: "/inicio_sesion",
  },
  RESUMEN: {
    path: "/resumen",
    permission: PERMISSIONS.SALE_VIEW_RESUME.key,
  },
  VENTAS: {
    path: "/ventas",
    permission: PERMISSIONS.SALE_VIEW.key,
  },
  CLIENTES: {
    path: "/clientes",
    permission: PERMISSIONS.CLIENT_VIEW.key,
  },
  PRODUCTOS: {
    path: "/productos",
    permission: PERMISSIONS.PRODUCT_VIEW.key,
  },
  SERVICIOS_ESPECIALES: {
    path: "/servicios",
    permission: PERMISSIONS.SPECIAL_SERVICE_VIEW.key,
  },
  CONFIGURACION: {
    path: "/configuracion",
    permission: PERMISSIONS.CONFIGURATION_VIEW.key,
  },
  ASIGNAR_PERMISOS: {
    path: "/gestion-permisos",
    permission: PERMISSIONS.USER_VIEW.key,
  },
  USUARIOS: {
    path: "/usuarios",
    permission: PERMISSIONS.USER_VIEW.key,
  },
  ROLES: {
    path: "/roles",
    permission: PERMISSIONS.USER_VIEW.key,
  },
  NOT_FOUND: {
    path: "*",
  },
} as const;
