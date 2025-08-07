import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import PageLayout from '../../src/components/layout/PageLayout';
import { PlusIcon } from '@heroicons/react/24/outline';
import { getSales, addSale, type Sale, type NewSaleData } from '../../src/services/saleService';
import Loader from '../../src/components/ui/Loader';
import Modal from '../../src/components/ui/Modal';
import SaleForm from '../../src/components/ventas/SaleForm';

function VentasContent() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sales.map((sale) => (
                      <tr key={sale.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sale.fecha.seconds * 1000).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.nombreCliente}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.items.length}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">S/{sale.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Registrar Nueva Venta">
        <SaleForm 
          onSubmit={handleSaveSale}
          onClose={handleCloseModal}
        />
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
