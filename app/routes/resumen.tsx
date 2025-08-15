import { useState, useEffect } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import {getSalesByDateRange} from '../../src/services/firebase/saleService';
import type { Sale } from '../../src/services/firebase/saleService';
// import { getSalesByDateRange } from '../../src/services/saleService';
// import type { Sale } from '../../src/services/saleService';
import { generateSalesReportPdf } from '../../src/components/pdf/SalesReportPdf';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Table, TableContainer } from '../../src/components/ui/Table';
import Loader from '../../src/components/ui/Loader';

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

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const salesData = await getSalesByDateRange(startDate, endDate);
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

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const numberOfSales = sales.length;

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

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setDateRange('today')} className={`px-4 py-1.5 text-sm font-medium text-gray-700 rounded-md hover:bg-white hover:shadow-sm transition-all ${activeFilter === 'today' ? 'bg-white shadow-sm' : ''}`}>Hoy</button>
            <button onClick={() => setDateRange('week')} className={`px-4 py-1.5 text-sm font-medium text-gray-700 rounded-md hover:bg-white hover:shadow-sm transition-all ${activeFilter === 'week' ? 'bg-white shadow-sm' : ''}`}>Esta Semana</button>
            <button onClick={() => setDateRange('month')} className={`px-4 py-1.5 text-sm font-medium text-gray-700 rounded-md hover:bg-white hover:shadow-sm transition-all ${activeFilter === 'month' ? 'bg-white shadow-sm' : ''}`}>Este Mes</button>
          </div>
          <div className="flex items-center gap-4">
            <div className=''>
              <label className="block text-xs font-medium pl-2 md:pl-0 text-gray-600 md:mb-1">Desde</label>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => date && setStartDate(getStartOfDay(date))}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                className="w-36 rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium pl-2 md:pl-0 text-gray-600 md:mb-1">Hasta</label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => date && setEndDate(getEndOfDay(date))}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd/MM/yyyy"
                className="w-36 rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"
              />
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total de Ventas</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">S/{totalSales.toFixed(2)}</p>
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
                  render: (sale) => new Date(sale.fechaDeVenta.seconds * 1000).toLocaleString()
                },
                {
                  key: 'cliente',
                  header: 'Cliente',
                  className: 'font-medium text-gray-900',
                  render: (sale) => sale.nombreCliente
                },
                {
                  key: 'productos',
                  header: 'Productos',
                  className: 'text-gray-800 font-mono max-w-[200px] md:max-w-[300px]',
                  render: (sale) => (
                    <div className="overflow-hidden text-ellipsis">
                      {sale.items.map(item => item.nombre).join(', ')}
                    </div>
                  )
                },
                {
                  key: 'total',
                  header: 'Total',
                  className: 'text-gray-800 font-mono',
                  render: (sale) => `S/${sale.total.toFixed(2)}`
                }
              ]}
              data={sales}
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
