import { usePermissions } from '../contexts/PermissionsContext';

export const useHasPermission = (requiredPermission: string): boolean => {
  const permissions = usePermissions();
  return permissions.includes(requiredPermission);
};
