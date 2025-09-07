import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import PageLayout from '../../src/components/layout/PageLayout';
import { PlusIcon, CreditCardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import PaymentHistoryModal from '../../src/components/servicios-especiales/PaymentHistoryModal';
import { 
  getSpecialServices, 
  addSpecialService, 
  updateSpecialService, 
  deleteDefinitiveSpecialService
} from '../../src/services/specialService';

import type { 
  SpecialService,
  NewSpecialServiceData 
} from '../../src/services/specialService';
import Modal from '../../src/components/ui/Modal';
import SpecialServiceForm from '../../src/components/servicios-especiales/SpecialServiceForm';
import PaymentModalLite from '../../src/components/servicios-especiales/PaymentModalLite';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Table, TableContainer } from '../../src/components/ui/Table';
import { addPayment, type NewPaymentData } from '../../src/services/paymentService';
import { useAlert } from '../../src/contexts/AlertContext';
import SystemLoader from '../../src/components/ui/SystemLoader';
import ActionButtons from '../../src/components/ui/ActionButtons';
import EntityActionsModal from '../../src/components/ui/EntityActionsModal';
import ConfirmDelete from '../../src/components/ui/ConfirmDelete';

function ServiciosEspecialesContent() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [services, setServices] = useState<SpecialService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<SpecialService | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const { showError, showSuccess } = useAlert();
  

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const servicesData = await getSpecialServices();
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
    if (service) {
      setCurrentService(service);
    } else {
      setCurrentService(null);
    }
    setIsModalOpen(true);
    setIsPaymentModalOpen(false);
    setShowActionsModal(false);
  };

  const handleCloseModal = () => {
    setCurrentService(null);
    setIsModalOpen(false);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    fetchServices(); // Recargar la lista de servicios
  };

  const handleRegisterPayment = async (data: { startDate: string; endDate: string; amount: number; notes: string }) => {
    if (!currentService) return;

    const paymentData: NewPaymentData = {
      service_id: currentService.id,
      amount: data.amount,
      payment_start_date: data.startDate,
      payment_end_date: data.endDate,
      payment_method: 'Efectivo',
      transaction_reference: '', // Opcional, se puede añadir un campo si es necesario
      notes: data.notes,
    };

    try {
      await addPayment(paymentData);
      showSuccess('Pago registrado exitosamente');
      handlePaymentSuccess();
    } catch (error: any) {
      console.error('Error al registrar el pago:', error);
      // Mostrar mensaje real del backend si existe
      const backendMsg = error?.response?.data?.message || 'No se pudo registrar el pago';
      showError('Error de validación', 8000, backendMsg);
    }
  };

  const handleSaveService = async (formData: NewSpecialServiceData) => {
    try {
      if (!formData.client_id) {
        throw new Error('Se requiere un cliente válido');
      }

      setIsLoading(true);
      const serviceData: NewSpecialServiceData = {
        client_id: formData.client_id,
        name: formData.name,
        deceased_name: formData.deceased_name,
        description: formData.description,
        price: formData.price,
        is_active: formData.is_active,
        is_paid: formData.is_paid,
        sector: formData.sector,
        start_date: formData.start_date,
        end_date: formData.end_date,
        recurrence_interval: formData.recurrence_interval,
        day_of_week: formData.day_of_week,
        day_of_month: formData.day_of_month,
      };

      if (currentService) {
        const updatedService = await updateSpecialService(currentService.id, serviceData);
        setServices(services.map(s => s.id === currentService.id ? updatedService : s));
      } else {
        const newService = await addSpecialService(serviceData);
        setServices([...services, newService]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar el servicio especial: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
    setShowActionsModal(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsLoading(true);
    try {
      await deleteDefinitiveSpecialService(Number(deleteId));
      setServices(services.filter(s => s.id !== deleteId));
      showSuccess('Servicio especial eliminado exitosamente');
    } catch (error) {
      console.error("Error al eliminar el servicio especial: ", error);
      showError('Error al eliminar el servicio especial');
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
          <SystemLoader />
        ) : (
          <TableContainer>
            <Table
              columns={[
                {
                  key: 'clientName',
                  header: 'Cliente',
                  className: 'text-gray-500',
                  render: (service) => (
                    <div>
                      <div className="font-medium">{service.client.name || 'Sin cliente'}</div>
                    </div>
                  )
                },
                {
                  key: 'deceasedName',
                  header: 'Difunto',
                  render: (service) => (
                    <div>
                      <div className="font-medium text-gray-900">{service.deceased_name}</div>
                    </div>
                  )
                },
                {
                  key: 'sector',
                  header: 'Nicho',
                  className: 'text-gray-500'
                },
                {
                  key: 'description',
                  header: 'Detalles',
                  className: 'text-gray-500'
                },
                {
                  key: 'startDate',
                  header: 'Fecha de inicio',
                  render: (service) => {
                    const startDate = typeof service.start_date === 'string' ? new Date(service.start_date) : service.start_date;
                    return format(startDate, 'PPP', { locale: es });
                  },
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
                  key: 'status',
                  header: 'Estado de pago',
                  render: (service: SpecialService) => (
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.is_paid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {service.is_paid ? 'Pagado' : 'Pendiente de pago'}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentService(service);
                          setIsHistoryModalOpen(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Ver historial de pagos"
                      >
                        <ClipboardDocumentCheckIcon className="-ml-1 mr-1 h-4 w-4" />Historial
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Registrar pago"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentService(service)
                          setIsPaymentModalOpen(true)
                        }}
                      >
                        <CreditCardIcon className="-ml-1 mr-1 h-4 w-4" />Pagar
                      </button>
                    </div>
                  )
                },
                {
                  key: 'actions',
                  header: 'Acciones',
                  render: (service: SpecialService) => (
                    <ActionButtons
                      onEdit={() => handleOpenModal(service)}
                      onDelete={() => handleDelete(service.id)}
                    />
                  ),
                },
              ]}
              data={services}
              keyExtractor={(service) => service.id}
              searchable
              onRowClick={(service) => {
                setCurrentService(service);
                setShowActionsModal(true);
              }}
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

      <PaymentHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        serviceId={currentService?.id || 0}
        serviceName={currentService?.description || ''}
        clientName={currentService?.client?.name || ''}
        deceasedName={currentService?.deceased_name || ''}
        price={currentService?.price || 0}
        isPaid={currentService?.is_paid || false}
      />

      <PaymentModalLite
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        serviceStartDate={
          currentService?.start_date
            ? typeof currentService.start_date === 'string'
              ? currentService.start_date
              : currentService.start_date.toISOString()
            : ''
        }
        serviceEndDate={
          currentService?.last_payment_date
            ? typeof currentService.last_payment_date === 'string'
              ? currentService.last_payment_date
              : currentService.last_payment_date.toISOString()
            : ''
        }
        lastPaymentDate={
          currentService?.last_payment_date
            ? typeof currentService.last_payment_date === 'string'
              ? currentService.last_payment_date
              : currentService.last_payment_date.toISOString()
            : null
        }
        recurrenceInterval={currentService?.recurrence_interval || 'weekly'}
        dayOfWeek={currentService?.day_of_week || 'thursday'}
        dayOfMonth={currentService?.day_of_month || null}
        price={currentService?.price || 0}
        onPayment={handleRegisterPayment}
      />
      <ConfirmDelete
        isOpen={showDeleteConfirm}
        title="Eliminar servicio especial"
        message='¿Estás seguro de eliminar este servicio?'
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onClose={() => { setShowDeleteConfirm(false); setDeleteId(null); }}
        loading={isLoading}
      />
      {/* Modal de acciones */}
      <EntityActionsModal
        isOpen={showActionsModal}
        onClose={() => setShowActionsModal(false)}
        entity={currentService}
        title={currentService?.client.name || 'Servicio Especial'}
        fields={[
          {
            key: 'description',
            label: 'Detalles',
            render: (value) => value || 'Sin detalles'
          },
          {
            key: 'start_date',
            label: 'Fecha de inicio',
            render: (value) => {
              if (!value) return 'Sin fecha';
              const date = typeof value === 'string' ? new Date(value) : value;
              return format(date, 'PPP', { locale: es });
            }
          },
          {
            key: 'price',
            label: 'Precio',
            render: (value) => `S/. ${value || 0}`
          },
          {
            key: 'is_paid',
            label: 'Estado de pago',
            render: (value) => (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                value 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
              {value ? 'Pagado' : 'Pendiente de pago'}
              </span>                        
            )
          },
        ]}
        onEdit={currentService ? () => handleOpenModal(currentService) : undefined}
        onDelete={currentService ? () => handleDelete(currentService.id) : undefined}
      />
    </>
  );
}

export default function ServiciosEspeciales() {
  return (
    <DashboardLayout>
      <ServiciosEspecialesContent />
    </DashboardLayout>
  );
}
