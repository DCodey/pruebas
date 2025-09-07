import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import PageLayout from '../../src/components/layout/PageLayout';
import { PlusIcon } from '@heroicons/react/24/outline';
import { getClients, addClient, updateClient, deleteClient, type Client } from '../../src/services/clientService';
import SystemLoader from '../../src/components/ui/SystemLoader';
import Modal from '../../src/components/ui/Modal';
import ClientForm from '../../src/components/clientes/ClientForm';
import EntityActionsModal from '../../src/components/ui/EntityActionsModal';
import { Table, TableContainer } from '../../src/components/ui/Table';
import ConfirmDelete from '../../src/components/ui/ConfirmDelete';
import { useAlert } from '../../src/contexts/AlertContext';
import ActionButtons from '../../src/components/ui/ActionButtons';

function ClientesContent() {
  const { showError, showSuccess } = useAlert();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await getClients();
        setClients(clientsData);
      } catch (error: any) {
        console.error("Error al cargar clientes: ", error);
        const errorMessage = error.response?.data?.message || 'Error al cargar los clientes';
        const errors = error.response?.data?.errors;
        showError(errorMessage, 10000, errors);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleAddClient = () => {
    setCurrentClient(null);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setCurrentClient({
      ...client,
      name: client.name || '',
      description: client.description || '',
      phone: client.phone || '',
      document_number: client.document_number || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    setShowActionsModal(false);
    setDeleteId(client.id);
    setShowDeleteConfirm(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentClient(null);
  };

  const handleSaveClient = async (formData: Omit<Client, 'id'>) => {
    setIsLoading(true);
    try {
      if (currentClient) {
        await updateClient(currentClient.id, formData);
        setClients((Array.isArray(clients) ? clients : []).map(c => c.id === currentClient.id ? { 
          ...c, 
          ...formData
        } : c));
      } else {
        const newId = await addClient(formData);
        setClients([...(Array.isArray(clients) ? clients : []), { 
          id: newId, 
          ...formData
        }]);
      }
      handleCloseModal();
    } catch (error: any) {
      console.error("Error al guardar el cliente: ", error);
      const errorMessage = error.response?.data?.message || 'Error al guardar el cliente';
      const errors = error.response?.data?.errors;
      showError(errorMessage, 10000, errors);
    } finally {
      setIsLoading(false);
    }
  };

  // handleDelete ya no es necesario, se usa handleDeleteClient

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsLoading(true);
    try {
      const { message } = await deleteClient(deleteId);
      setClients((Array.isArray(clients) ? clients : []).filter(c => c.id !== deleteId));
      if (message) showSuccess(message);
    } catch (error: any) {
      console.error("Error al eliminar el cliente: ", error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar el cliente';
      const errors = error.response?.data?.errors;
      showError(errorMessage, 10000, errors);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    }
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
        form="client-form"
        className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-70 flex items-center"
        disabled={isLoading}
      >
        Guardar
      </button>
    </div>
  );

  return (
    <>
      <PageLayout
        title="Clientes"
        description="Una lista de todos los clientes frecuentes."
        headerAction={(
          <button
            type="button"
            onClick={() => handleAddClient()}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Registrar Cliente
          </button>
        )}
      >
        <TableContainer>
          <Table
            columns={[
              {
                key: 'name',
                header: 'Nombre',
                className: 'font-medium text-gray-900',
                render: (client: Client) => client.name || 'Sin nombre'
              },
              {
                key: 'description',
                header: 'Descripción',
                className: 'text-gray-500',
                render: (client: Client) => client.description || 'Sin descripción'
              },
              {
                key: 'phone',
                header: 'Celular',
                className: 'text-gray-500',
                render: (client: Client) => client.phone || 'Sin teléfono'
              },
              {
                key: 'document_number',
                header: 'Número de Documento',
                className: 'text-gray-500',
                render: (client: Client) => client.document_number || 'Sin documento'
              },
              {
                key: 'actions',
                header: 'Acciones',
                className: 'text-right',
                render: (client: Client) => (
                  <ActionButtons
                    onEdit={() => handleEditClient(client)}
                    onDelete={() => handleDeleteClient(client)}
                  />
                )
              }
            ]}
            data={clients}
            searchable
            keyExtractor={(client) => client.id}
            onRowClick={(client) => {
              setCurrentClient(client);
              setShowActionsModal(true);
            }}
            emptyMessage="No hay clientes registrados"
            rowClassName="hover:bg-gray-50 cursor-pointer"
          />
        </TableContainer>

        {/* Modal de acciones */}
        <EntityActionsModal
          isOpen={showActionsModal}
          onClose={() => setShowActionsModal(false)}
          entity={currentClient}
          title={currentClient?.name || 'Cliente'}
          fields={[
            {
              key: 'phone',
              label: 'Teléfono',
              render: (value) => value || 'Sin teléfono'
            },
            {
              key: 'document_number',
              label: 'Documento',
              render: (value) => value || 'Sin documento'
            },
            {
              key: 'description',
              label: 'Notas',
              render: (value) => value || 'Sin notas',
              className: 'mt-2'
            }
          ]}
          onEdit={currentClient ? () => handleEditClient(currentClient) : undefined}
          onDelete={currentClient ? () => handleDeleteClient(currentClient) : undefined}
        />
      </PageLayout>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentClient ? 'Editar Cliente' : 'Registrar Cliente'}
        footer={modalFooter}>
        <ClientForm 
          client={currentClient}
          onSubmit={handleSaveClient}
          onClose={handleCloseModal}
        />
      </Modal>
      <ConfirmDelete
        isOpen={showDeleteConfirm}
        title="Eliminar cliente"
        message="¿Estás seguro de eliminar este cliente?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onClose={() => { setShowDeleteConfirm(false); setDeleteId(null); }}
      />
  {isLoading && ( <SystemLoader /> )}
    </>
  );
}

export default function Clientes() {
  return (
    <DashboardLayout>
      <ClientesContent />
    </DashboardLayout>
  );
}
