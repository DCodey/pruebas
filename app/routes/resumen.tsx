import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import { getSalesByDateRange, type Sale } from '../../src/services/saleService';
import { generateSalesReportPdf } from '../../src/components/pdf/SalesReportPdf';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Table, TableContainer } from '../../src/components/ui/Table';
import Loader from '../../src/components/ui/Loader';
import MultiSelect, { type MultiSelectOption } from '../../src/components/ui/MultiSelect';
import { getPaymentMethods, type PaymentMethod } from '../../src/services/PaymentMethodService';

// Helper para fechas
const getStartOfDay = (date: Date) => new Date(date.setHours(0, 0, 0, 0));
const getEndOfDay = (date: Date) => new Date(date.setHours(23, 59, 59, 999));

export function Resumen() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(getStartOfDay(new Date()));
  const [endDate, setEndDate] = useState<Date>(getEndOfDay(new Date()));
  const [activeFilter, setActiveFilter] = useState<'today' | 'week' | 'month'>('today');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<MultiSelectOption[]>([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<MultiSelectOption[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoadingPaymentMethods(true);
      try {
        const methods = await getPaymentMethods();
        setPaymentMethodOptions(
          methods.filter(m => m.is_active).map(m => ({ value: m.id?.toString() || '', label: m.name }))
        );
      } catch (error) {
        setPaymentMethodOptions([]);
      } finally {
        setLoadingPaymentMethods(false);
      }
    };
    fetchPaymentMethods();
  }, []);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const salesData = await getSalesByDateRange(startDate.toISOString(), endDate.toISOString());
        setSales(salesData);
      } catch (error) {
        console.error("Error al obtener las ventas:", error);
        setSales([]);
      }
      setLoading(false);
    };

    fetchSales();
  }, [startDate, endDate]);

  const setDateRange = (filter: 'today' | 'week' | 'month') => {
    setActiveFilter(filter);
    const today = new Date();
    let start = getStartOfDay(today);
    let end = getEndOfDay(today);

    if (filter === 'week') {
      const dayOfWeek = today.getDay();
      const daysSinceMonday = (dayOfWeek + 6) % 7; // Lunes = 0, Domingo = 6
      start = getStartOfDay(new Date(today.setDate(today.getDate() - daysSinceMonday)));
    } else if (filter === 'month') {
      start = getStartOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
    }

    setStartDate(start);
    setEndDate(end);
  };

  const filteredSales = sales.filter(sale => {
    if (paymentMethodFilter.length === 0) {
      return true; // Si no hay filtro, mostrar todas las ventas
    }
    // Comprobar si el método de pago de la venta está en los filtros seleccionados
    return paymentMethodFilter.some(option => option.value === sale.payment_method?.id.toString());
  });

  const totalSales = filteredSales.reduce((sum, sale) => sum + parseFloat(String(sale.total)), 0);

  const numberOfSales = filteredSales.length;

  const handleExportPdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateSalesReportPdf({
        sales,
        startDate,
        endDate,
        totalSales: numberOfSales,
        totalAmount: totalSales
      });
    } catch (error) {
      console.error('Error al generar el PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <>
      <div className="py-4 md:px-6 px-1">
        <div className='flex mb-6 space-x-2 justify-between items-center'>
          <h1 className="text-2xl font-semibold text-gray-900">Resumen</h1>
          {/* Filtros */}
          <div className="">
            <button
              onClick={handleExportPdf}
              disabled={isGeneratingPdf || sales.length === 0}
              className={`flex items-center px-2 py-1 rounded-md text-white text-sm font-medium ${sales.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} transition-colors`}
            >
              <ArrowDownTrayIcon className="h-4 w-4 font-bold mr-1" />
              {isGeneratingPdf ? 'Generando...' : 'Descargar Reporte'}
            </button>
          </div>
        </div>

        <div className="border border-gray-200 grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8 p-4 bg-white rounded-lg shadow-sm">
          {/* Filtros rápidos */}
          <div className="p-2 rounded-md items-center flex border border-gray-50">
            <div className="flex flex-wrap items-center gap-2 bg-gray-100 p-2 rounded-lg border border-gray-200">
              {['today', 'week', 'month'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateRange(filter as 'today' | 'week' | 'month')}
                  className={`px-4 py-1.5 text-sm font-medium text-gray-700 rounded-md hover:bg-white hover:shadow-sm transition-all ${activeFilter === filter ? 'bg-white shadow-sm' : ''
                    }`}
                >
                  {filter === 'today' ? 'Hoy' : filter === 'week' ? 'Esta Semana' : 'Este Mes'}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros avanzados */}
          <div className="p-2 rounded-md border border-gray-50">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6 xl:col-span-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => date && setStartDate(getStartOfDay(date))}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  dateFormat="dd/MM/yyyy"
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"
                />
              </div>

              <div className="col-span-6 xl:col-span-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => date && setEndDate(getEndOfDay(date))}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  dateFormat="dd/MM/yyyy"
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"
                />
              </div>

              <div className="col-span-12 xl:col-span-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Método de Pago</label>
                <MultiSelect
                  id="paymentMethodFilter"
                  value={paymentMethodFilter}
                  onChange={(selectedOptions) => setPaymentMethodFilter(selectedOptions as MultiSelectOption[])}
                  options={paymentMethodOptions}
                  isLoading={loadingPaymentMethods}
                  containerClassName="w-full"
                  className="text-sm"
                  placeholder={loadingPaymentMethods ? 'Cargando...' : 'Todos'}
                />
              </div>
            </div>
          </div>
        </div>


        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total de Ventas</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">S/{Number(totalSales).toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Cantidad de Ventas</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{numberOfSales}</p>
          </div>
        </div>

        {/* Tabla de Ventas */}
        <div className="relative">
          {loading && (
            <Loader />
          )}
          <TableContainer>
            <Table
              columns={[
                {
                  key: 'fecha',
                  header: 'Fecha',
                  className: 'text-gray-600',
                  render: (sale) => new Date(sale.sale_date).toLocaleString()
                },
                {
                  key: 'cliente',
                  header: 'Cliente',
                  className: 'font-medium text-gray-900',
                  render: (sale) => sale.client_name
                },
                {
                  key: 'productos',
                  header: 'Productos',
                  className: 'text-gray-800 font-mono max-w-[200px] md:max-w-[300px]',
                  render: (sale) => (
                    <div className="overflow-hidden text-ellipsis">
                      {sale.items.map(item => item.product_name).join(', ')}
                    </div>
                  )
                },
                {
                  key: 'metodoPago',
                  header: 'Método de Pago',
                  className: 'text-gray-800 font-mono',
                  render: (sale) => sale.payment_method?.name || '-'
                },
                {
                  key: 'total',
                  header: 'Total',
                  className: 'text-gray-800 font-mono',
                  render: (sale) => `S/${sale.total}`
                }
              ]}
              data={filteredSales}
              keyExtractor={(sale) => sale.id}
              emptyMessage="No hay ventas en el período seleccionado"
              rowClassName="hover:bg-gray-100"
            />
          </TableContainer>
        </div>
      </div>
    </>
  );
}

export default function ResumenPage() {
  return (
    <DashboardLayout>
      <Resumen />
    </DashboardLayout>
  );
}
