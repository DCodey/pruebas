import { PERMISSIONS } from './permissions';

type PermissionGroup = {
  category: string;
  permissions: Array<{
    key: string;
    name: string;
  }>;
};

export const getPermissionGroups = (): PermissionGroup[] => {
  const permissionGroups: Record<string, { key: string; name: string }[]> = {};

  Object.values(PERMISSIONS).forEach((permission) => {
    const category = permission.category;
    if (!permissionGroups[category]) {
      permissionGroups[category] = [];
    }
    permissionGroups[category].push({
      key: permission.key,
      name: permission.name
    });
  });

  return Object.entries(permissionGroups).map(([category, permissions]) => ({
    category,
    permissions: permissions.sort((a, b) => a.name.localeCompare(b.name))
  }));
};

export const getAllPermissionKeys = (): string[] => {
  return Object.values(PERMISSIONS).map(p => p.key);
};
