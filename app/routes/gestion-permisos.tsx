import React, { useEffect, useState } from 'react';
import * as rolesService from '../../src/services/rolesService';
import { useAlert } from 'src/contexts/AlertContext';
import { DashboardLayout } from 'src/components/layout/DashboardLayout';
import PageLayout from 'src/components/layout/PageLayout';
import { getPermissionGroups, getAllPermissionKeys } from 'src/utils/permissionGroups';
import { Checkbox } from 'src/components/ui/Checkbox';
import { Button } from 'src/components/ui/Button';
import Select from 'src/components/ui/Select';
import SystemLoader from 'src/components/ui/SystemLoader';
import NewRoleModal from 'src/components/roles/NewRoleModal';
import { withPermission } from 'src/hoc/withPermission';
import { PERMISSIONS } from 'src/utils/permissions';
import { useHasPermission } from 'src/hoc/useHasPermission';

// Tipos importados desde rolesService
type Role = rolesService.Role;

// Definir el tipo para permisos normalizados (puede ser un objeto con key/name o un string)
type NormalizedPermission = { key: string; name: string } | string;
type SelectedPermission = NormalizedPermission;

export function RolesPermisosPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<SelectedPermission>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useAlert();
  const permissionGroups = getPermissionGroups();
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const canViewRoles = useHasPermission(PERMISSIONS.ROLE_VIEW.key);
  const canCreateRole = useHasPermission(PERMISSIONS.ROLE_CREATE.key);
  const canAssignPermissions = useHasPermission(PERMISSIONS.ROLE_ASSIGN_PERMISSIONS.key);

  // Función para crear un nuevo rol
  const handleCreateRole = async (roleName: string) => {
    try {
      setIsCreatingRole(true);
      // Usar el método addRole del servicio de roles
      const newRole = await rolesService.addRole(roleName);

      // Actualizar la lista de roles
      const updatedRoles = await rolesService.getRoles();
      setRoles(updatedRoles);

      // Seleccionar el nuevo rol
      setSelectedRoleId(newRole.id);

      // Cerrar el modal
      setIsNewRoleModalOpen(false);

      showSuccess('Rol creado exitosamente');
    } catch (error) {
      console.error('Error al crear rol:', error);
      showError('No se pudo crear el rol. Intente nuevamente.');
    } finally {
      setIsCreatingRole(false);
    }
  };

  // Cargar roles al montar el componente
  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      try {
        const rolesData = await rolesService.getRoles();
        setRoles(rolesData);
      } catch (error) {
        showError('Error al cargar los roles');
        console.error('Error loading roles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  // Cargar permisos cuando se selecciona un rol o cambia la lista de roles
  // Función auxiliar para normalizar un permiso a nuestro formato estándar
  const normalizePermission = (permission: any): NormalizedPermission | string => {
    // Si es un string, buscar en los grupos de permisos para obtener más información
    if (typeof permission === 'string') {
      // Si el string está vacío, devolverlo como está
      if (!permission.trim()) return permission;

      // Buscar el permiso en los grupos para obtener su información completa
      for (const group of permissionGroups) {
        const found = group.permissions.find(p => p.key === permission);
        if (found) {
          return { key: found.key, name: found.name };
        }
      }
      // Si no se encuentra en los grupos, devolver un objeto con el string como key y name
      return { key: permission, name: permission };
    }

    // Si es un objeto con 'name' (formato del endpoint)
    if (permission && typeof permission === 'object' && 'name' in permission) {
      const permissionKey = permission.name;
      if (!permissionKey) return { key: '', name: '' };

      // Buscar el permiso en los grupos para obtener su información completa
      for (const group of permissionGroups) {
        const found = group.permissions.find(p => p.key === permissionKey);
        if (found) {
          return { key: found.key, name: found.name };
        }
      }
      // Si no se encuentra, devolver un objeto con el name como key y name
      return { key: permissionKey, name: permissionKey };
    }

    // Si es un objeto con 'key' (formato interno)
    if (permission && typeof permission === 'object' && 'key' in permission) {
      const key = String(permission.key || '');
      return {
        key: key,
        name: String(permission.name || permission.key || '')
      };
    }

    // Cualquier otro caso, devolver un objeto vacío
    console.warn('Tipo de permiso no reconocido:', permission);
    return { key: '', name: '' };
  };

  useEffect(() => {
    if (!selectedRoleId) {
      setSelectedPermissions(new Set());
      return;
    }

    const role = roles.find(r => Number(r.id) === Number(selectedRoleId));
    if (!role) {
      console.error('Rol no encontrado con ID:', selectedRoleId);
      setSelectedPermissions(new Set());
      return;
    }

    try {
      let permissionsToProcess: any[] = [];

      // Normalizar los permisos a un array
      if (Array.isArray(role.permissions)) {
        permissionsToProcess = [...role.permissions];
      } else if (typeof role.permissions === 'string') {
        // Intentar parsear si es un string JSON
        try {
          const parsed = JSON.parse(role.permissions);
          permissionsToProcess = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          permissionsToProcess = [role.permissions];
        }
      } else if (role.permissions) {
        // Si es un solo objeto, convertirlo a array
        permissionsToProcess = [role.permissions];
      }

      // Normalizar cada permiso al formato estándar
      const normalizedPermissions = permissionsToProcess
        .map(permission => {

          const normalized = normalizePermission(permission);

          return normalized;
        })
        .filter(p => {
          const isValid = typeof p === 'string' ? Boolean(p) : Boolean(p?.key);

          return isValid;
        });

      setSelectedPermissions(new Set(normalizedPermissions));
    } catch (error) {
      console.error('Error al procesar los permisos:', error);
      setSelectedPermissions(new Set());
    }
  }, [selectedRoleId, roles]);

  const handleRoleChange = (roleId: string) => {

    setSelectedRoleId(roleId);

    if (!roleId) {

      setSelectedPermissions(new Set());
      return;
    }

    const role = roles.find(r => Number(r.id) === Number(roleId));

    if (role) {

      // Manejar diferentes formatos de permisos
      let permissionsToProcess: any[] = [];

      // Normalizar los permisos a un array
      if (Array.isArray(role.permissions)) {
        permissionsToProcess = [...role.permissions];
      } else if (typeof role.permissions === 'string') {
        // Intentar parsear si es un string JSON
        try {
          const parsed = JSON.parse(role.permissions);
          permissionsToProcess = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          permissionsToProcess = [role.permissions];
        }
      } else if (role.permissions) {
        // Si es un solo objeto, convertirlo a array
        permissionsToProcess = [role.permissions];
      }

      // Normalizar cada permiso al formato estándar
      const normalizedPermissions = permissionsToProcess
        .map(p => {
          if (typeof p === 'string') {
            // Buscar el permiso en los grupos para obtener su información completa
            for (const group of permissionGroups) {
              const found = group.permissions.find(perm => perm.key === p);
              if (found) {
                return { key: found.key, name: found.name };
              }
            }
            return p; // Si no se encuentra, devolver el string
          } else if (p && typeof p === 'object' && 'key' in p) {
            // Si ya es un objeto con key, asegurarse de que tenga el formato correcto
            return {
              key: String(p.key || ''),
              name: String(p.name || p.key || '')
            };
          }
          return String(p); // Cualquier otro caso, convertirlo a string
        })
        .filter(p => {
          if (typeof p === 'string') return Boolean(p);
          return Boolean(p?.key);
        });

      setSelectedPermissions(new Set(normalizedPermissions));
    } else {      
      setSelectedPermissions(new Set());
    }
  };

  // Función para verificar si un permiso está seleccionado
  const isPermissionSelected = (permissionKey: string): boolean => {
    return Array.from(selectedPermissions).some(p => {
      if (typeof p === 'string') {
        return p === permissionKey;
      } else if (p && typeof p === 'object' && 'key' in p) {
        return p.key === permissionKey;
      }
      return false;
    });
  };

  const handlePermissionToggle = (permissionKey: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPermissions(prev => {
      // Crear un nuevo Set basado en los permisos actuales
      const newPermissions = new Set<SelectedPermission>();

      // Buscar el permiso en los grupos para obtener su información completa
      let permissionObj: SelectedPermission | null = null;

      for (const group of permissionGroups) {
        const found = group.permissions.find(p => p.key === permissionKey);
        if (found) {
          permissionObj = { key: found.key, name: found.name };
          break;
        }
      }

      // Si no se encuentra en los grupos, usar solo la clave
      if (!permissionObj) {
        permissionObj = permissionKey;
      }

      // Si el checkbox está marcado, agregar el permiso si no existe
      if (e.target.checked) {
        // Verificar si ya existe el permiso
        let exists = false;
        for (const p of prev) {
          if (typeof p === 'string' && p === permissionKey) {
            exists = true;
            break;
          } else if (p && typeof p === 'object' && 'key' in p && p.key === permissionKey) {
            exists = true;
            break;
          }
        }

        // Si no existe, agregarlo
        if (!exists) {
          prev.forEach(p => newPermissions.add(p));
          newPermissions.add(permissionObj);

        } else {
          // Si ya existe, mantener los permisos actuales

          return new Set(prev);
        }
      } else {
        // Si el checkbox se desmarca, eliminar el permiso
        for (const p of prev) {
          if (typeof p === 'string' && p === permissionKey) {
            // No agregar este permiso (lo estamos eliminando)
            continue;
          } else if (p && typeof p === 'object' && 'key' in p && p.key === permissionKey) {
            // No agregar este permiso (lo estamos eliminando)
            continue;
          }
          newPermissions.add(p);
        }
      }
      return newPermissions;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Obtener todos los permisos como objetos {key, name}
      const allPermissions: SelectedPermission[] = [];

      // Recorrer todos los grupos de permisos
      permissionGroups.forEach(group => {
        group.permissions.forEach(permission => {
          // Verificar si el permiso ya existe en los seleccionados
          const exists = Array.from(selectedPermissions).some(p => {
            if (typeof p === 'string') {
              return p === permission.key;
            } else if (p && typeof p === 'object' && 'key' in p) {
              return p.key === permission.key;
            }
            return false;
          });

          // Si no existe, agregarlo
          if (!exists) {
            allPermissions.push({ key: permission.key, name: permission.name });
          }
        });
      });

      // Crear un nuevo Set con los permisos existentes más los nuevos
      const updatedPermissions = new Set([...selectedPermissions, ...allPermissions]);
      setSelectedPermissions(updatedPermissions);

    } else {
      // Si se desmarca, limpiar todos los permisos
      setSelectedPermissions(new Set());
    }
  };

  const handleSave = async () => {
    if (!selectedRoleId) {
      showError('No hay ningún rol seleccionado');
      return;
    }

    setSaving(true);
    try {

      const permissions = Array.from(selectedPermissions).map(p => {
        if (typeof p === 'string') {
          return p;
        } else if (p && typeof p === 'object' && 'key' in p) {
          return p.key;
        }
        return '';
      }).filter(Boolean); // Eliminar strings vacíos

      // Enviar solo los nombres de los permisos al backend
      await rolesService.updateRolePermissions(selectedRoleId, permissions);
      showSuccess('Permisos actualizados correctamente');

      // Actualizar la lista de roles con los nuevos permisos
      setRoles(prev =>
        prev.map(role =>
          role.id === selectedRoleId
            ? {
              ...role,
              permissions: permissions.map(name => ({ name })), // Formato esperado por el frontend
              permissionsString: JSON.stringify(permissions) // Para compatibilidad
            }
            : role
        )
      );

    } catch (error: any) {      
      const errorMessage = error?.response?.data?.message || 'Error desconocido';
      console.error('Error al guardar los permisos:', errorMessage, error);
      showError(`Error al guardar los permisos: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <SystemLoader />
      </div>
    );
  }

  return (
    <>
      <NewRoleModal
        isOpen={isNewRoleModalOpen}
        onClose={() => setIsNewRoleModalOpen(false)}
        onSubmit={handleCreateRole}
        isSubmitting={isCreatingRole}
      />
      <PageLayout
        title="Gestión de Permisos"
        description="Asigna y gestiona los permisos para cada rol del sistema"
        actions={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {canCreateRole && (
              <Button
                onClick={() => setIsNewRoleModalOpen(true)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nuevo Rol
                </span>
              </Button>
            )}
            {canViewRoles && (
              <div className="flex-1 max-w-md">
                <Select
                  value={selectedRoleId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRoleChange(e.target.value)}
                  className="w-full"
                  options={[
                    { value: '', label: 'Seleccionar un rol...' },
                    ...roles.map(role => ({
                      value: role.id,
                      label: role.name
                    }))
                  ]}
                />
              </div>
            )}
            {canAssignPermissions && (
              <Button
                onClick={handleSave}
                disabled={!selectedRoleId || saving}
                isLoading={saving}
                className="w-full sm:w-auto"
                variant="primary"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar cambios
                </span>
              </Button>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          {selectedRoleId ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Permisos para <span className="text-primary-600">{roles.find(r => r.id === selectedRoleId)?.name}</span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedPermissions.size} de {getAllPermissionKeys().length} permisos seleccionados
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-xs cursor-pointer hover:bg-gray-50">
                      <Checkbox
                        id="select-all"
                        checked={selectedPermissions.size === getAllPermissionKeys().length}
                        onChange={handleSelectAll}
                        color='primary'
                        size='lg'
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {selectedPermissions.size === getAllPermissionKeys().length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {permissionGroups.map(group => {
                    const groupPermissions = group.permissions || [];
                    const selectedCount = groupPermissions.filter(p =>
                      isPermissionSelected(p.key)
                    ).length;
                    const allSelected = selectedCount === groupPermissions.length;

                    return (
                      <div
                        key={group.category}
                        className={`border rounded-xl overflow-hidden transition-all duration-200 ${allSelected
                            ? 'border-primary-200 bg-primary-50/30'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                      >
                        <div className={`px-4 py-3 border-b ${allSelected ? 'bg-primary-50 border-primary-100' : 'bg-gray-50 border-gray-100'
                          }`}>
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm uppercase tracking-wider text-gray-700">
                              {group.category}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${allSelected
                                ? 'bg-primary-100 text-primary-800'
                                : 'bg-gray-100 text-gray-600'
                              }`}>
                              {selectedCount}/{groupPermissions.length}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 space-y-3">
                          {groupPermissions.map(permission => {
                            const isSelected = isPermissionSelected(permission.key);
                            return (
                              <div
                                key={permission.key}
                                className={`flex items-start p-2 rounded-lg transition-colors ${isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'
                                  }`}
                              >
                                <Checkbox
                                  id={permission.key}
                                  checked={isSelected}
                                  onChange={handlePermissionToggle(permission.key)}
                                  color='primary'
                                  size='lg'
                                />
                                <label
                                  htmlFor={permission.key}
                                  className={`ml-3 text-sm ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'
                                    }`}
                                >
                                  {permission.name}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-primary-50 text-primary-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay rol seleccionado</h3>
                <p className="text-gray-500 mb-4">
                  Por favor, selecciona un rol de la lista superior para comenzar a gestionar sus permisos.
                </p>
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
}

export const RolesPermisos = () => (
  <DashboardLayout>
    <RolesPermisosPage />
  </DashboardLayout>
);

export default withPermission(RolesPermisos, PERMISSIONS.ROLE_VIEW.key);
