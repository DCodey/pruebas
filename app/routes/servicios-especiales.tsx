import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import PageLayout from '../../src/components/layout/PageLayout';
import { PlusIcon, PencilIcon, TrashIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { 
  getSpecialServices, 
  createSpecialService, 
  updateSpecialService, 
  type SpecialService, 
  deleteDefinitiveSpecialService
} from '../../src/services/firebase/specialService';
import Loader from '../../src/components/ui/Loader';
import Modal from '../../src/components/ui/Modal';
import SpecialServiceForm from '../../src/components/servicios-especiales/SpecialServiceForm';
import { PaymentModal } from '../../src/components/servicios-especiales/PaymentModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableContainer } from '../../src/components/ui/Table';

function ServiciosEspecialesContent() {
  const [services, setServices] = useState<SpecialService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<SpecialService | null>(null);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const servicesData = await getSpecialServices(true);
      setServices(servicesData);
    } catch (error) {
      console.error("Error al cargar servicios especiales: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenModal = (service: SpecialService | null = null) => {
    setCurrentService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentService(null);
    setIsModalOpen(false);
  };

  const handlePaymentSuccess = () => {
    fetchServices(); // Refresh the services list
  };

  const handleSaveService = async (formData: Omit<SpecialService, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      if (currentService) {
        await updateSpecialService(currentService.id, formData);
        setServices(services.map(s => s.id === currentService.id ? { ...s, ...formData } : s));
      } else {
        const newId = await createSpecialService(formData);
        setServices([...services, { id: newId, ...formData, createdAt: new Date(), updatedAt: new Date() }]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar el servicio especial: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {    
    try {
      setIsLoading(true);
      await deleteDefinitiveSpecialService(id);
      setServices(services.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error al eliminar el servicio especial: ", error);
    } finally {
      setIsLoading(false);
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
        form="special-service-form"
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
        title="Servicios Especiales"
        description="Una lista de todos los servicios especiales."
        headerAction={(
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Registrar Servicio Especial
          </button>
        )}
      >
        {isLoading ? (
          <Loader />
        ) : (
          <TableContainer>
            <Table
              columns={[
                {
                  key: 'clientName',
                  header: 'Cliente',
                  className: 'font-medium text-gray-900',
                  render: (service) => (
                    <div>
                      <div className="font-medium">{service.clientName || 'Sin cliente'}</div>
                    </div>
                  )
                },
                {
                  key: 'deceasedName',
                  header: 'Difunto',
                  render: (service) => (
                    <div>
                      <div className="font-medium text-gray-900">{service.deceasedName}</div>
                    </div>
                  )
                },
                {
                  key: 'sector',
                  header: 'Nicho',
                  className: 'text-gray-500'
                },
                {
                  key: 'startDate',
                  header: 'Fecha de inicio',
                  render: (service) => format(service.startDate, 'PPP', { locale: es }),
                  className: 'text-gray-500'
                },
                {
                  key: 'price',
                  header: 'Precio',
                  className: 'text-right',
                  render: (service) => (
                    <div className="text-right">
                      S/. {service.price}
                    </div>
                  )
                },
                {
                  key: 'isActive',
                  header: 'Estado',
                  render: (service: SpecialService) => (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  ),
                  className: 'text-gray-500'
                },
                {
                  key: 'status',
                  header: 'Estado de pago',
                  render: (service: SpecialService) => (
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.isPaid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {service.isPaid ? 'Pagado' : 'Pendiente de pago'}
                        </span>                        
                      </div>
                    )
                },             
                {
                  key: 'payment',
                  header: 'Acción de Pago',
                  render: (service: SpecialService) => (
                    <div className="flex items-center space-x-2">
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Registrar pago"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentService(service);
                          setIsPaymentModalOpen(true);
                        }}
                      >
                        <CreditCardIcon className="-ml-1 mr-1 h-4 w-4" />
                        {service.isPaid ? 'Modificar pago' : 'Registrar pago'}
                      </button>
                    </div>
                  )
                },
                {
                  key: 'actions',
                  header: 'Acciones',
                  render: (service: SpecialService) => (
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(service);
                        }}
                        className="text-primary-600 hover:text-primary-900"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('¿Estás seguro de que deseas eliminar permanentemente este servicio?')) {
                            handleDelete(service.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar permanentemente"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ),
                  className: 'text-right',
                },
              ]}
              data={services}
              keyExtractor={(service) => service.id}
              onRowClick={handleOpenModal}
              emptyMessage="No hay servicios especiales registrados"
              rowClassName="hover:bg-gray-50 cursor-pointer"
            />
          </TableContainer>
        )}
      </PageLayout>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={currentService ? 'Editar Servicio Especial' : 'Registrar Servicio Especial'}
        footer={modalFooter}
      >
        <SpecialServiceForm 
          initialData={currentService || undefined}
          onSubmit={handleSaveService}
          onCancel={handleCloseModal}
        />
      </Modal>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        serviceId={currentService?.id || ''}
        serviceStartDate={currentService?.startDate}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}

export default function ServiciosEspeciales() {
  return (
    <DashboardLayout>
      <ServiciosEspecialesContent/>
    </DashboardLayout>
  );
}
