import React from 'react';
import { usePermissions } from '../contexts/PermissionsContext';

export const withPermission = (
  WrappedComponent: React.ComponentType<any>,
  requiredPermission: string
) => {
  return (props: any) => {
    const permissions = usePermissions();

    if (!permissions.includes(requiredPermission)) {
      return null; // 👈 O puedes retornar algún mensaje o componente
    }

    return <WrappedComponent {...props} />;
  };
};
