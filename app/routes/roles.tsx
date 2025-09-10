import { useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/16/solid";
import { useAlert } from "src/contexts/AlertContext";
import { useHasPermission } from "src/hoc/useHasPermission";
import { withPermission } from "src/hoc/withPermission";
import { PERMISSIONS } from "src/utils/permissions";
import { DashboardLayout } from "../../src/components/layout/DashboardLayout";
import PageLayout from "../../src/components/layout/PageLayout";
import { TableContainer, Table } from "src/components/ui/Table";
import ActionButtons from "src/components/ui/ActionButtons";
import EntityActionsModal from "src/components/ui/EntityActionsModal";
import ConfirmDelete from "src/components/ui/ConfirmDelete";
import SystemLoader from "src/components/ui/SystemLoader";
import type { Role } from "src/services/rolesService";
import * as rolesService from "src/services/rolesService";
import NewRoleModal from "src/components/roles/NewRoleModal";

export function RolesContent() {
    const [showModal, setShowModal] = useState(false);
    const [currentRole, setCurrentRole] = useState<Role | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [roles, setRoles] = useState<Role[]>([]);
    const [showActionsModal, setShowActionsModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const canCreateRole = useHasPermission(PERMISSIONS.ROLE_CREATE.key);
    const canEditRole = useHasPermission(PERMISSIONS.ROLE_EDIT.key);
    const canDeleteRole = useHasPermission(PERMISSIONS.ROLE_DELETE.key);
    const { showError, showSuccess } = useAlert();

    const fetchRoles = async () => {
        try {
            setIsLoading(true);
            const rolesData = await rolesService.getRoles();
            setRoles(rolesData);
        } catch (error) {
            console.error('Error al cargar roles:', error);
            showError('Error al cargar la lista de roles');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleAddRole = () => {
        setCurrentRole(null);
        setShowModal(true);
    };

    const handleCreateRole = async (roleName: string) => {
        try {
            setIsSubmitting(true);
            const newRole = await rolesService.addRole(roleName);
            setRoles([...roles, newRole]);
            setShowModal(false);
            showSuccess('Rol creado exitosamente');
            return Promise.resolve();
        } catch (error) {
            console.error('Error al crear rol:', error);
            showError('Error al crear el rol');
            return Promise.reject(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateRole = async (roleName: string) => {
        if (!currentRole) return Promise.reject('No hay rol seleccionado');

        try {
            setIsSubmitting(true);
            const updatedRole = await rolesService.updateRole({
                ...currentRole,
                name: roleName,
                permissions: []
            });

            setRoles(roles.map(role =>
                role.id === currentRole.id ? updatedRole : role
            ));

            setShowModal(false);
            setCurrentRole(null);
            showSuccess('Rol actualizado exitosamente');
            return Promise.resolve();
        } catch (error) {
            console.error('Error al actualizar rol:', error);
            showError('Error al actualizar el rol');
            return Promise.reject(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditRole = (role: Role) => {
        setCurrentRole(role);
        setIsEditing(true);
        setShowModal(true);
        setShowActionsModal(false);
    };

    const confirmDelete = async (id: string) => {
        if (!id) return;
        setIsLoading(true);
        try {
            const { message } = await rolesService.deleteRole(id);
            setRoles((Array.isArray(roles) ? roles : []).filter(r => r.id !== id));
            if (message) showSuccess(message);
        } catch (error: any) {
            console.error("Error al eliminar el rol: ", error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar el rol';
            const errors = error.response?.data?.errors;
            showError(errorMessage, 10000, errors);
        } finally {
            setIsLoading(false);
            setShowDeleteConfirm(false);
            setDeleteId(null);
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
        setShowActionsModal(false);
      };

    return (
        <PageLayout
            title="Roles"
            description="Gestión de roles"
            headerAction={canCreateRole && (
                <button
                    type="button"
                    onClick={handleAddRole}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Nuevo Rol
                </button>
            )}
        >
            <TableContainer>
                <Table
                    keyExtractor={(role: Role) => role.id}
                    columns={[
                        {
                            key: 'name',
                            header: 'Nombre',
                            className: 'font-medium text-gray-900',
                            render: (role: Role) => role.name || 'Sin nombre'
                        },
                        {
                            key: 'permissions',
                            header: 'Permisos',
                            render: (role: Role) =>
                                role.permissions && Array.isArray(role.permissions)
                                    ? role.permissions.length
                                    : 0,
                            className: 'text-gray-500'
                        },
                        ...(canEditRole || canDeleteRole ? [{
                            key: 'actions',
                            header: 'Acciones',
                            className: 'text-right',
                            render: (role: Role) => (
                                <ActionButtons
                                    onEdit={canEditRole ? () => handleEditRole(role) : undefined}
                                    onDelete={canDeleteRole ? () => {
                                        setDeleteId(role.id);
                                        setShowDeleteConfirm(true);
                                    } : undefined}
                                    editPermission={PERMISSIONS.ROLE_EDIT.key}
                                    deletePermission={PERMISSIONS.ROLE_DELETE.key}
                                />
                            )
                        }] : [])
                    ]}
                    data={roles}
                    emptyMessage="No hay roles registrados"
                    rowClassName="hover:bg-gray-50"
                    onRowClick={
                        (role: Role) => {
                            setShowActionsModal(true);
                            setCurrentRole(role);
                        }
                    }
                />
            </TableContainer>

            {/* Modal para crear nuevo rol */}
            <NewRoleModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setCurrentRole(null);
                    setIsEditing(false);
                }}
                onSubmit={isEditing ? handleUpdateRole : handleCreateRole}
                isSubmitting={isSubmitting}
                roleToEdit={isEditing ? currentRole : null}
            />

            {/* Confirmación de eliminación */}
            <ConfirmDelete
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={() => confirmDelete(deleteId!)}
                title="Eliminar Rol"
                message="¿Estás seguro de que deseas eliminar este rol?"
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
            <EntityActionsModal
                isOpen={showActionsModal}
                onClose={() => setShowActionsModal(false)}
                entity={currentRole}
                title={currentRole?.name || 'Cliente'}
                viewPermission={PERMISSIONS.CLIENT_VIEW.key}
                editPermission={PERMISSIONS.CLIENT_EDIT.key}
                deletePermission={PERMISSIONS.CLIENT_DELETE.key}
                fields={[
                    {
                        key: 'name',
                        label: 'Nombre del rol',
                        render: (value) => value || 'Sin nombre'
                    },
                ]}
                onEdit={currentRole ? () => handleEditRole(currentRole) : undefined}
                onDelete={currentRole ? () => handleDelete(currentRole.id) : undefined}
            />

            {isLoading && <SystemLoader />}
        </PageLayout>
    );
}

const Roles = () => {
    return (
        <DashboardLayout>
            <RolesContent />
        </DashboardLayout>
    );
};

export default withPermission(Roles, PERMISSIONS.ROLE_VIEW.key);