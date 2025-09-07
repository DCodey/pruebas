import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import { getSalesByDateRange, type Sale } from '../../src/services/saleService';
import { generateSalesReportPdf } from '../../src/components/pdf/SalesReportPdf';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Table, TableContainer } from '../../src/components/ui/Table';
import MultiSelect, { type MultiSelectOption } from '../../src/components/ui/MultiSelect';
import { getPaymentMethods } from '../../src/services/PaymentMethodService';
import SystemLoader from '../../src/components/ui/SystemLoader';

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
        totalAmount: totalSales,
        paymentMethod: paymentMethodFilter.length === 1 ? paymentMethodFilter[0].label : undefined
      });
    } catch (error) {
      console.error('Error al generar el PDF:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="py-8 md:px-8 px-2">
      <div className="flex flex-col md:flex-row mb-8 gap-4 md:gap-0 justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Resumen</h1>
        <button
          onClick={handleExportPdf}
          disabled={isGeneratingPdf || sales.length === 0}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm border border-green-200 bg-white text-green-700 hover:bg-green-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
        >
          <ArrowDownTrayIcon className="h-4 w-4 mr-1 text-green-500" />
          {isGeneratingPdf ? 'Generando...' : 'Descargar Reporte'}
        </button>
      </div>

      <div className="border border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 p-3 md:p-6 bg-white rounded-xl shadow-sm align-items-center">
        {/* Filtros rápidos */}
        <div className="flex md:items-center gap-2">
          {['today', 'week', 'month'].map((filter) => (
            <button
              key={filter}
              onClick={() => setDateRange(filter as 'today' | 'week' | 'month')}
              className={`px-6 py-2 text-xs md:text-sm font-medium rounded-md border ${activeFilter === filter ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-700'} hover:bg-green-50 transition-all`}
            >
              {filter === 'today' ? 'Hoy' : filter === 'week' ? 'Esta Semana' : 'Este Mes'}
            </button>
          ))}
        </div>

        {/* Filtros avanzados */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6 xl:col-span-4">
            <label className="block text-xs font-medium text-green-700 mb-1">Desde</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => date && setStartDate(getStartOfDay(date))}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              className="w-full rounded-md border border-gray-300 shadow-sm focus:border-green-600 focus:outline-none focus:ring-green-600 sm:text-sm p-2 bg-white"
            />
          </div>
          <div className="col-span-6 xl:col-span-4">
            <label className="block text-xs font-medium text-green-700 mb-1">Hasta</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => date && setEndDate(getEndOfDay(date))}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="dd/MM/yyyy"
              className="w-full rounded-md border border-gray-300 shadow-sm focus:border-green-600 focus:outline-none focus:ring-green-600 sm:text-sm p-2 bg-white"
            />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <label className="block text-xs font-medium text-green-700 mb-1">Método de Pago</label>
            <MultiSelect
              id="paymentMethodFilter"
              value={paymentMethodFilter}
              onChange={(selectedOptions) => setPaymentMethodFilter(selectedOptions as MultiSelectOption[])}
              options={paymentMethodOptions}
              isLoading={loadingPaymentMethods}
              containerClassName="w-full"
              className="text-sm focus:border-green-600 focus:outline-none focus:ring-green-600 rounded-md"
              placeholder={loadingPaymentMethods ? 'Cargando...' : 'Todos'}
            />
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-3 md:p-6 rounded-xl shadow-sm border border-green-100 flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-2">Total de Ventas</h3>
          <p className="text-3xl font-bold text-green-700 bg-green-50 rounded-lg px-4 py-2 inline-block border border-green-100">
            <span className="">S/</span>{Number(totalSales).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-3 md:p-6 rounded-xl shadow-sm border border-green-100 flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-2">Cantidad de Ventas</h3>
          <p className="text-3xl font-bold text-green-700 bg-green-50 rounded-lg px-4 py-2 inline-block border border-green-100">
            <span className="">{numberOfSales}</span>
          </p>
        </div>
      </div>

      {/* Tabla de Ventas */}
      <div className="relative">
        {loading && (
          <SystemLoader />
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
            rowClassName="hover:bg-gray-50"
          />
        </TableContainer>
      </div>
    </div>
  );
}

export default function ResumenPage() {
  return (
    <DashboardLayout>
      <Resumen />
    </DashboardLayout>
  );
}
