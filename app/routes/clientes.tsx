import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import PageLayout from '../../src/components/layout/PageLayout';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getClients, addClient, updateClient, deleteClient, type Client } from '../../src/services/clientService';
import Loader from '../../src/components/ui/Loader';
import Modal from '../../src/components/ui/Modal';
import ClientForm from '../../src/components/clientes/ClientForm';
import { Table, TableContainer } from '../../src/components/ui/Table';

function ClientesContent() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await getClients();
        setClients(clientsData);
      } catch (error) {
        console.error("Error al cargar clientes: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleOpenModal = (client: Client | null = null) => {
    setCurrentClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentClient(null);
  };

  const handleSaveClient = async (formData: { nombre: string; descripcion: string; celular: number }) => {
    setIsLoading(true);
    try {
      if (currentClient) {
        await updateClient(currentClient.id, formData);
        setClients(clients.map(c => c.id === currentClient.id ? { ...c, ...formData } : c));
      } else {
        const newId = await addClient(formData);
        setClients([...clients, { id: newId, ...formData }]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar el cliente: ", error);
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
      } catch (error) {
        console.error("Error al eliminar el cliente: ", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

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
                key: 'nombre',
                header: 'Nombre',
                className: 'font-medium text-gray-900'
              },
              {
                key: 'descripcion',
                header: 'Descripción',
                className: 'text-gray-500'
              },
              {
                key: 'celular',
                header: 'Celular',
                className: 'text-gray-500'
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentClient ? 'Editar Cliente' : 'Registrar Cliente'}>
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
