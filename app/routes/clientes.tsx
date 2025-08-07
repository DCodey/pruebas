import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import PageLayout from '../../src/components/layout/PageLayout';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getClients, addClient, updateClient, deleteClient, type Client } from '../../src/services/clientService';
import Loader from '../../src/components/ui/Loader';
import Modal from '../../src/components/ui/Modal';
import ClientForm from '../../src/components/clientes/ClientForm';

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

  const handleSaveClient = async (formData: { nombre: string; descripcion: string; }) => {
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
        description="Una lista de todos los clientes, incluyendo su nombre y descripción."
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
        <div className="flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.descripcion}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button onClick={() => handleOpenModal(client)} className="text-primary-600 hover:text-primary-900"><PencilIcon className="h-5 w-5"/></button>
                          <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
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
