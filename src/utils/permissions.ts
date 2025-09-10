interface Permission {
  key: string;
  name: string;
  category: string;
}
interface PermissionsType {
  // Permisos de clientes
  CLIENT_VIEW: Permission;
  CLIENT_CREATE: Permission;
  CLIENT_EDIT: Permission;
  CLIENT_DELETE: Permission;
  
  // Permisos de ventas
  SALE_VIEW: Permission;
  SALE_CREATE: Permission;
  SALE_EDIT: Permission;
  SALE_DELETE: Permission;
  SALE_VIEW_RESUME: Permission;

  // Permisos de productos
  PRODUCT_VIEW: Permission;
  PRODUCT_CREATE: Permission;
  PRODUCT_EDIT: Permission;
  PRODUCT_DELETE: Permission;
  
  // Permisos de servicios especiales
  SPECIAL_SERVICE_VIEW: Permission;
  SPECIAL_SERVICE_CREATE: Permission;
  SPECIAL_SERVICE_EDIT: Permission;
  SPECIAL_SERVICE_DELETE: Permission;

  // Permisos de pagos
  PAYMENT_VIEW: Permission;
  PAYMENT_CREATE: Permission;
  //PAYMENT_EDIT: Permission;
  //PAYMENT_DELETE: Permission;

  // Permisos de configuración
  CONFIGURATION_VIEW: Permission;
  CONFIGURATION_CREATE: Permission;
  CONFIGURATION_EDIT: Permission;
  CONFIGURATION_DELETE: Permission;
  
  // Permisos de usuarios
  USER_VIEW: Permission;
  USER_CREATE: Permission;
  USER_EDIT: Permission;
  USER_DELETE: Permission;

  // Permisos de roles
  ROLE_VIEW: Permission;
  ROLE_CREATE: Permission;
  ROLE_EDIT: Permission;
  ROLE_DELETE: Permission;
  ROLE_ASSIGN_PERMISSIONS: Permission;
}

export const PERMISSIONS: PermissionsType = {
  // Permisos de clientes
  CLIENT_VIEW: {
    key: 'client.view',
    name: 'Ver Clientes',
    category: 'Clientes'
  },
  CLIENT_CREATE: {
    key: 'client.create',
    name: 'Crear Clientes',
    category: 'Clientes'
  },
  CLIENT_EDIT: {
    key: 'client.edit',
    name: 'Editar Clientes',
    category: 'Clientes'
  },
  CLIENT_DELETE: {
    key: 'client.delete',
    name: 'Eliminar Clientes',
    category: 'Clientes'
  },
  
  // Permisos de ventas
  SALE_VIEW: {
    key: 'sale.view',
    name: 'Ver Ventas',
    category: 'Ventas'
  },
  SALE_CREATE: {
    key: 'sale.create',
    name: 'Crear Ventas',
    category: 'Ventas'
  },
  SALE_EDIT: {
    key: 'sale.edit',
    name: 'Editar Ventas',
    category: 'Ventas'
  },
  SALE_DELETE: {
    key: 'sale.delete',
    name: 'Eliminar Ventas',
    category: 'Ventas'
  },
  SALE_VIEW_RESUME: {
    key: 'sale.view.resume',
    name: 'Resumen de Ventas',
    category: 'Ventas'
  },

  // Permisos de productos
  PRODUCT_VIEW: {
    key: 'product.view',
    name: 'Ver Productos',
    category: 'Productos'
  },
  PRODUCT_CREATE: {
    key: 'product.create',
    name: 'Crear Productos',
    category: 'Productos'
  },
  PRODUCT_EDIT: {
    key: 'product.edit',
    name: 'Editar Productos',
    category: 'Productos'
  },
  PRODUCT_DELETE: {
    key: 'product.delete',
    name: 'Eliminar Productos',
    category: 'Productos'
  },
  
  // Permisos de servicios especiales
  SPECIAL_SERVICE_VIEW: {
    key: 'service.view',
    name: 'Ver Servicios Especiales',
    category: 'Servicios Especiales'
  },
  SPECIAL_SERVICE_CREATE: {
    key: 'service.create',
    name: 'Crear Servicios Especiales',
    category: 'Servicios Especiales'
  },
  SPECIAL_SERVICE_EDIT: {
    key: 'service.edit',
    name: 'Editar Servicios Especiales',
    category: 'Servicios Especiales'
  },
  SPECIAL_SERVICE_DELETE: {
    key: 'service.delete',
    name: 'Eliminar Servicios Especiales',
    category: 'Servicios Especiales'
  },

  //Permisos de pagos
  PAYMENT_VIEW: {
    key: 'payment.view',
    name: 'Ver Pagos',
    category: 'Pagos'
  },
  PAYMENT_CREATE: {
    key: 'payment.create',
    name: 'Crear Pagos',
    category: 'Pagos'
  },
  // PAYMENT_EDIT: {
  //   key: 'payment.edit',
  //   name: 'Editar Pagos',
  //   category: 'Pagos'
  // },
  // PAYMENT_DELETE: {
  //   key: 'payment.delete',
  //   name: 'Eliminar Pagos',
  //   category: 'Pagos'
  // },

  // Permisos de configuración
  CONFIGURATION_VIEW: {
    key: 'setting.view',
    name: 'Ver Configuración',
    category: 'Configuración'
  },
  CONFIGURATION_CREATE: {
    key: 'setting.create',
    name: 'Crear Configuración',
    category: 'Configuración'
  },
  CONFIGURATION_EDIT: {
    key: 'setting.edit',
    name: 'Editar Configuración',
    category: 'Configuración'
  },
  CONFIGURATION_DELETE: {
    key: 'setting.delete',
    name: 'Eliminar Configuración',
    category: 'Configuración'
  },

  // Permisos de usuarios
  USER_VIEW: {
    key: 'user.view',
    name: 'Ver Usuarios',
    category: 'Usuarios'
  },
  USER_CREATE: {
    key: 'user.create',
    name: 'Crear Usuarios',
    category: 'Usuarios'
  },
  USER_EDIT: {
    key: 'user.edit',
    name: 'Editar Usuarios',
    category: 'Usuarios'
  },
  USER_DELETE: {
    key: 'user.delete',
    name: 'Eliminar Usuarios',
    category: 'Usuarios'
  },

  //Permisos de roles
  ROLE_VIEW: {
    key: 'role.view',
    name: 'Ver Roles',
    category: 'Roles'
  },
  ROLE_CREATE: {
    key: 'role.create',
    name: 'Crear Roles',
    category: 'Roles'
  },
  ROLE_EDIT: {
    key: 'role.edit',
    name: 'Editar Roles',
    category: 'Roles'
  },
  ROLE_DELETE: {
    key: 'role.delete',
    name: 'Eliminar Roles',
    category: 'Roles'
  },
  ROLE_ASSIGN_PERMISSIONS: {
    key: 'role.assign.permissions',
    name: 'Asignar Permisos',
    category: 'Roles'
  },
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
