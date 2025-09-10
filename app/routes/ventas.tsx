import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import PageLayout from '../../src/components/layout/PageLayout';
import { PlusIcon } from '@heroicons/react/24/outline';
import { PERMISSIONS } from 'src/utils/permissions';
import EditSaleModal from '../../src/components/ventas/EditSaleModal';
import {
  getSales,
  addSale,
  deleteSale,
  getSaleById,
  type Sale,
  type NewSaleData
} from '../../src/services/saleService';
import Modal from '../../src/components/ui/Modal';
import ConfirmDelete from '../../src/components/ui/ConfirmDelete';
import SaleForm from '../../src/components/ventas/SaleForm';
import SaleDetailsModal from '../../src/components/ventas/SaleDetailsModal';
import { useAlert } from '../../src/contexts/AlertContext';
import { TableContainer, Table } from '../../src/components/ui/Table';
import SystemLoader from 'src/components/ui/SystemLoader';
import ActionButtons from 'src/components/ui/ActionButtons';
import EntityActionsModal from 'src/components/ui/EntityActionsModal';
import { withPermission } from 'src/hoc/withPermission';
import { useHasPermission } from 'src/hoc/useHasPermission';
import { Button } from 'src/components/ui/Button';

function VentasContent() {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);

  const { showError, showSuccess } = useAlert();
  const canViewSale = useHasPermission(PERMISSIONS.SALE_VIEW.key);
  const canCreateSale = useHasPermission(PERMISSIONS.SALE_CREATE.key);
  const canEditSale = useHasPermission(PERMISSIONS.SALE_EDIT.key);
  const canDeleteSale = useHasPermission(PERMISSIONS.SALE_DELETE.key);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const salesData = await getSales();
      setSales(salesData);
    } catch (error) {
      console.error('Error al cargar ventas: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveSale = async (formData: NewSaleData) => {
    try {
      setIsLoading(true);
      const newSaleId = await addSale(formData);
      const completeSale = await getSaleById(newSaleId);
      setSales(prev => [completeSale, ...prev]);
      setIsModalOpen(false);
      showSuccess('Venta registrada exitosamente');
      setSelectedSale(completeSale);
      setIsViewModalOpen(true);
    } catch (error: any) {
      console.error('Error al guardar la venta: ', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar la venta';
      const errors = error.response?.data?.errors;
      showError(errorMessage, 10000, errors);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (sale: Sale) => {
    setSaleToDelete(sale);
    setShowActionsModal(false);
  };

  const handleConfirmDelete = async () => {
    if (!saleToDelete) return;

    try {
      setIsLoading(true);
      await deleteSale(saleToDelete.id);
      setSaleToDelete(null);
      showSuccess('Venta eliminada exitosamente');
      await fetchSales();
      setShowActionsModal(false);
    } catch (error: any) {
      console.error('Error al eliminar la venta: ', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar la venta';
      const errors = error.response?.data?.errors;
      showError(errorMessage, 10000, errors);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (sale: Sale) => {
    try {
      setIsLoading(true);
      const saleDetails = await getSaleById(sale.id);
      setSelectedSale(saleDetails);

      setIsViewModalOpen(true);
      setShowActionsModal(false);
    } catch (error) {
      console.error('Error al cargar detalles de la venta: ', error);
      showError('No se pudo cargar los detalles de la venta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUpdated = (sale: Sale) => {
    setSaleToEdit(sale);
    setCurrentSale(sale);
    setEditModalOpen(true);
    setShowActionsModal(false);
  };

  return (
    <>
      <PageLayout
        title="Ventas"
        description="Registro histórico de todas las ventas realizadas."
        headerAction={
          canCreateSale && (
            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={handleOpenModal}
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Registrar Venta
              </Button>
            </div>
          )
        }
      >
        <TableContainer>
          <Table<Sale>
            columns={[
              {
                key: 'sale_date',
                header: 'Fecha de venta',
                render: (sale: Sale) => (
                  <span className="text-sm text-gray-500">
                    {new Date(sale.sale_date).toLocaleString()}
                  </span>
                )
              },
              {
                key: 'client_name',
                header: 'Cliente',
                render: (sale: Sale) => (
                  <span className="text-sm font-medium text-gray-900">
                    {sale.client_name || 'Anónimo'}
                  </span>
                )
              },
              {
                key: 'items',
                header: 'Productos',
                render: (sale: Sale) => (
                  <div className="max-w-[200px] md:max-w-[300px] overflow-hidden text-ellipsis">
                    <span className="text-sm text-gray-500">
                      {sale.items.map((item: any) => item.product_name || 'Producto sin nombre').join(', ')}
                    </span>
                  </div>
                )
              },
              {
                key: 'items_count',
                header: 'Items',
                render: (sale: Sale) => sale.items.length
              },
              {
                key: 'payment_method',
                header: 'Método de Pago',
                render: (sale: Sale) => (
                  <span className="text-sm text-gray-500 uppercase">
                    {sale?.payment_method?.name || '-'}
                  </span>
                )
              },
              {
                key: 'total',
                header: 'Total',
                render: (sale: Sale) => `S/ ${sale.total}`
              },

              ...(canViewSale || canEditSale || canDeleteSale ? [
                {
                  key: 'actions',
                  header: 'Acciones',
                  className: 'text-right',
                  render: (sale: Sale) => (
                    <ActionButtons
                      onView={() => handleViewDetails(sale)}
                      onEdit={() => handleEditUpdated(sale)}
                      onDelete={() => handleDeleteClick(sale)}
                      editPermission={PERMISSIONS.SALE_EDIT.key}
                      deletePermission={PERMISSIONS.SALE_DELETE.key}
                    />
                  )
                }
              ] : [])
            ]}
            data={sales}
            keyExtractor={(sale: Sale) => sale.id.toString()}
            emptyMessage="No hay ventas registradas"
            rowClassName="hover:bg-gray-50"
            searchable
            onRowClick={(sale) => {
              setCurrentSale(sale);
              setShowActionsModal(true);
            }}
          />
        </TableContainer>
        <ConfirmDelete
          isOpen={saleToDelete !== null}
          onClose={() => setSaleToDelete(null)}
          onConfirm={handleConfirmDelete}
          loading={isLoading}
          title="Eliminar venta"
          message='¿Estás seguro de que deseas eliminar esta venta?'
          confirmText="Eliminar"
          cancelText="Cancelar"
        />
      </PageLayout>

      {/* Modales */}
      <SaleDetailsModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        sale={selectedSale}
      />
      <EditSaleModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
        }}
        sale={saleToEdit}
        onUpdated={(updatedSale) => {
          handleEditUpdated(updatedSale);
          fetchSales(); // Solo recarga si se editó
        }}
      />

      {/* Modal de acciones */}
      <EntityActionsModal
        isOpen={showActionsModal}
        onClose={() => setShowActionsModal(false)}
        entity={currentSale}
        title={currentSale?.client_name || 'Venta'}
        viewPermission={PERMISSIONS.SALE_VIEW.key}
        editPermission={PERMISSIONS.SALE_EDIT.key}
        deletePermission={PERMISSIONS.SALE_DELETE.key}
        fields={[
          {
            key: 'payment_method',
            label: 'Método de Pago',
            render: (value) => value?.name || 'Sin método de pago'
          },
          {
            key: 'sale_date',
            label: 'Fecha de Venta',
            render: (value) => new Date(value).toLocaleString() || 'Sin fecha de venta'
          },
          {
            key: 'total',
            label: 'Total',
            render: (value: number) => value || 'Sin precio',
            className: 'mt-2'
          }
        ]}
        onView={currentSale ? () => handleViewDetails(currentSale) : undefined}
        onEdit={currentSale ? () => handleEditUpdated(currentSale) : undefined}
        onDelete={currentSale ? () => handleDeleteClick(currentSale) : undefined}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Registrar Nueva Venta"
        footer={
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="sale-form"
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Registrar Venta
              <svg className="ml-2 -mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        }
      >
        <SaleForm onSubmit={handleSaveSale} onClose={handleCloseModal} />
      </Modal>
      {isLoading && <SystemLoader />}
    </>
  );
}

export function Ventas() {
  return (
    <DashboardLayout>
      <VentasContent />
    </DashboardLayout>
  );
}

export default withPermission(Ventas, PERMISSIONS.SALE_VIEW.key);

