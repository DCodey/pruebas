import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import PageLayout from '../../src/components/layout/PageLayout';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getClients, addClient, updateClient, deleteClient, type Client } from '../../src/services/clientService';
import Loader from '../../src/components/ui/Loader';
import Modal from '../../src/components/ui/Modal';
import ClientForm from '../../src/components/clientes/ClientForm';
import { Table, TableContainer } from '../../src/components/ui/Table';
import { useAlert } from '../../src/contexts/AlertContext';

function ClientesContent() {
  const { showError } = useAlert();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);

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

  const handleOpenModal = (client: Client | null = null) => {
    if (client) {
      setCurrentClient({
        ...client,
        name: client.name || '',
        description: client.description || '',
        phone: client.phone || '',
        document_number: client.document_number
      });
    } else {
      setCurrentClient(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentClient(null);
  };

  interface ClientFormData {
    nombre: string;
    descripcion: string;
    celular: number;
    numeroDocumento?: string;
  }

  const handleSaveClient = async (formData: Omit<Client, 'id'>) => {
    setIsLoading(true);
    try {
      if (currentClient) {
        await updateClient(currentClient.id, formData);
        setClients(clients.map(c => c.id === currentClient.id ? { 
          ...c, 
          ...formData
        } : c));
      } else {
        const newId = await addClient(formData);
        setClients([...clients, { 
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

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      setIsLoading(true);
      try {
        await deleteClient(id);
        setClients(clients.filter(c => c.id !== id));
      } catch (error: any) {
        console.error("Error al eliminar el cliente: ", error);
        const errorMessage = error.response?.data?.message || 'Error al eliminar el cliente';
        const errors = error.response?.data?.errors;
        showError(errorMessage, 10000, errors);
      } finally {
        setIsLoading(false);
      }
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
            onClick={() => handleOpenModal(null)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Registrar Cliente
          </button>
        )}
      >
        {isLoading && <Loader />}
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
                render: (client) => (
                  <div className="space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(client);
                      }} 
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <PencilIcon className="h-5 w-5"/>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(client.id);
                      }} 
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5"/>
                    </button>
                  </div>
                )
              }
            ]}
            data={clients}
            keyExtractor={(client) => client.id}
            onRowClick={handleOpenModal}
            emptyMessage="No hay clientes registrados"
            rowClassName="hover:bg-gray-50 cursor-pointer"
          />
        </TableContainer>
      </PageLayout>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentClient ? 'Editar Cliente' : 'Registrar Cliente'}
        footer={modalFooter}>
        <ClientForm 
          client={currentClient}
          onSubmit={handleSaveClient}
          onClose={handleCloseModal}
        />
      </Modal>
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
