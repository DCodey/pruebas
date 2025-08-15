import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import PageLayout from '../../src/components/layout/PageLayout';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getSales, addSale, deleteSale, type Sale, type NewSaleData } from '../../src/services/firebase/saleService';
import Loader from '../../src/components/ui/Loader';
import Modal from '../../src/components/ui/Modal';
import SaleForm from '../../src/components/ventas/SaleForm';

function VentasContent() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      const salesData = await getSales();
      setSales(salesData);
    } catch (error) {
      console.error("Error al cargar ventas: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveSale = async (formData: NewSaleData) => {
    try {
      setIsLoading(true);
      await addSale(formData);
      handleCloseModal();
      await fetchSales(); // Recargar la lista de ventas
    } catch (error) {
      console.error("Error al guardar la venta: ", error);
      alert(`Error al registrar la venta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (sale: Sale) => {
    setSaleToDelete(sale);
  };

  const handleConfirmDelete = async () => {
    if (!saleToDelete) return;
    
    try {
      setIsLoading(true);
      await deleteSale(saleToDelete.id);
      setSaleToDelete(null);
      await fetchSales(); // Recargar la lista de ventas
    } catch (error) {
      console.error("Error al eliminar la venta: ", error);
      alert(`Error al eliminar la venta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageLayout
        title="Ventas"
        description="Registro histórico de todas las ventas realizadas."
        headerAction={(
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Registrar Venta
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de venta</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Productos</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sales.map((sale) => (
                      <tr key={sale.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sale.fechaDeVenta.seconds * 1000).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.nombreCliente}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[200px] md:max-w-[300px] overflow-hidden text-ellipsis">{sale.items.map(item => item.nombre).join(', ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.items.length}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">S/{sale.total.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(sale)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar venta"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
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
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Registrar Venta
              <svg className="ml-2 -mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        }
      >
        <SaleForm 
          onSubmit={handleSaveSale}
          onClose={handleCloseModal}
        />
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={saleToDelete !== null}
        onClose={() => setSaleToDelete(null)}
        title="Confirmar eliminación"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSaleToDelete(null)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Eliminar
            </button>
          </div>
        }
      >
        <div className="text-gray-600">
          <p>¿Estás seguro de que deseas eliminar esta venta?</p>
          {saleToDelete && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p><strong>Cliente:</strong> {saleToDelete.nombreCliente}</p>
              <p><strong>Fecha:</strong> {new Date(saleToDelete.fechaDeVenta.seconds * 1000).toLocaleString()}</p>
              <p><strong>Total:</strong> S/{saleToDelete.total.toFixed(2)}</p>
              <p className="mt-2">Esta acción no se puede deshacer.</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

export default function Ventas() {
  return (
    <DashboardLayout>
      <VentasContent />
    </DashboardLayout>
  );
}
