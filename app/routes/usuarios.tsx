// pages/Usuarios.tsx

import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { withPermission } from 'src/hoc/withPermission';
import { PERMISSIONS } from 'src/utils/permissions';

import { DashboardLayout } from 'src/components/layout/DashboardLayout';
import PageLayout from 'src/components/layout/PageLayout';

import SystemLoader from 'src/components/ui/SystemLoader';
import Modal from 'src/components/ui/Modal';
import ConfirmDelete from 'src/components/ui/ConfirmDelete';
import EntityActionsModal from 'src/components/ui/EntityActionsModal';
import ActionButtons from 'src/components/ui/ActionButtons';

import { Table, TableContainer } from 'src/components/ui/Table';
import UserForm from 'src/components/usuarios/UserForm';

import { useAlert } from 'src/contexts/AlertContext';

import {
  type User,
  getUsers,
  addUser,
  updateUser,
  deleteUser
} from 'src/services/userService';
import { useHasPermission } from 'src/hoc/useHasPermission';
import { Button } from 'src/components/ui/Button';

function UserContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const { showError } = useAlert();
  const canCreateUser = useHasPermission(PERMISSIONS.USER_CREATE.key);
  const canEditUser = useHasPermission(PERMISSIONS.USER_EDIT.key);
  const canDeleteUser = useHasPermission(PERMISSIONS.USER_DELETE.key);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Error al cargar los usuarios';
        const errors = error.response?.data?.errors;
        showError(errorMessage, 10000, errors);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setSelectedUser(user);
    setIsModalOpen(true);
    setShowActionsModal(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    try {
      await deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
      setShowDeleteConfirm(false);
      setDeleteId(null);
      setShowActionsModal(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar el usuario';
      const errors = error.response?.data?.errors;
      showError(errorMessage, 10000, errors);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: Omit<User, 'id'>) => {
    setIsLoading(true);
    try {
      if (currentUser) {
        const updatedUser = await updateUser({ id: currentUser.id, ...formData });
        setUsers(users.map((u) => (u.id === currentUser.id ? updatedUser : u)));
      } else {
        const newUser = await addUser(formData);
        setUsers([...users, newUser]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error al guardar el usuario';
      const errors = error.response?.data?.errors;
      showError(errorMessage, 10000, errors);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };
  const modalFooter = (
    <div className="flex justify-end gap-x-3">
      <button
        type="button"
        onClick={handleCloseModal}
        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        disabled={isLoading}
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="user-form"
        className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-500 disabled:opacity-70 flex items-center"
        disabled={isLoading}
      >
        {isLoading ? <SystemLoader className="h-5 w-5" /> : 'Guardar'}
      </button>
    </div>
  );

  return (
    <PageLayout
      title="Usuarios"
      description="Gestión de usuarios"
      actions={
        canCreateUser && (
          <Button
            type="button"
            onClick={handleAddUser}
            variant="primary"            
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
            Nuevo usuario
          </Button>
        )}
    >
      <div className="mt-8">
        <TableContainer>
          <Table
            columns={[
              {
                key: 'name',
                header: 'Nombre',
                render: (user: User) => user.name
              },
              {
                key: 'email',
                header: 'Usuario',
                render: (user: User) => user.email
              },
              {
                key: 'role',
                header: 'Rol',
                render: (user: User) => Array.isArray(user.role) ? user.role.join(', ') : (user.role || 'Sin rol')
              },

              ...(canEditUser || canDeleteUser ? [
                {
                  key: 'actions',
                  header: 'Acciones',
                  className: 'text-right',
                  render: (user: User) => (
                    <ActionButtons
                      onEdit={() => handleEditUser(user)}
                      onDelete={() => {
                        setDeleteId(user.id);
                        setShowDeleteConfirm(true);
                      }}
                      editPermission={PERMISSIONS.USER_EDIT.key}
                      deletePermission={PERMISSIONS.USER_DELETE.key}
                    />
                  )
                }
              ] : [])
            ]}
            keyExtractor={(user) => user.id}
            data={users}
            emptyMessage="No hay usuarios registrados"
            rowClassName="hover:bg-gray-50"
            onRowClick={(user) => {
              setCurrentUser(user);
              setShowActionsModal(true);
            }}
          />
        </TableContainer>
      </div>

      <ConfirmDelete
        isOpen={showDeleteConfirm}
        onConfirm={() => handleDeleteUser(deleteId!)}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        }}
        title="Eliminar usuario"
        message="¿Estás seguro de que deseas eliminar este usuario?"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={currentUser ? 'Editar usuario' : 'Nuevo usuario'}
        footer={modalFooter}
      >
        <UserForm
          user={currentUser}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          isSubmitting={isLoading}
        />
      </Modal>

      <EntityActionsModal
        isOpen={showActionsModal}
        onClose={() => setShowActionsModal(false)}
        entity={currentUser}
        title={currentUser?.name || 'Usuario'}
        viewPermission={PERMISSIONS.USER_VIEW.key}
        editPermission={PERMISSIONS.USER_EDIT.key}
        deletePermission={PERMISSIONS.USER_DELETE.key}
        fields={[
          {
            key: 'email',
            label: 'Usuario',
            render: (value) => value || 'Sin usuario'
          },
          {
            key: 'role',
            label: 'Rol',
            render: (value) =>
              Array.isArray(value) ? value.join(', ') : (value || 'Sin rol')
          }
        ]}
        onEdit={currentUser ? () => handleEditUser(currentUser) : undefined}
        onDelete={currentUser ? () => handleDeleteUser(currentUser.id) : undefined}
      />
      {isLoading && (<SystemLoader />)}
    </PageLayout>

  );
}

const Usuarios = () => (
  <DashboardLayout>
    <UserContent />
  </DashboardLayout>
);

export default withPermission(Usuarios, PERMISSIONS.USER_VIEW.key);
