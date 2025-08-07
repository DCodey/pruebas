import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../src/components/layout/DashboardLayout';
import PageLayout from '../../src/components/layout/PageLayout';
import { getSalesByDateRange } from '../../src/services/saleService';
import type { Sale } from '../../src/services/saleService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Helper para fechas
const getStartOfDay = (date: Date) => new Date(date.setHours(0, 0, 0, 0));
const getEndOfDay = (date: Date) => new Date(date.setHours(23, 59, 59, 999));

export function Resumen() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(getStartOfDay(new Date()));
  const [endDate, setEndDate] = useState<Date>(getEndOfDay(new Date()));
  const [activeFilter, setActiveFilter] = useState<'today' | 'week' | 'month'>('today');

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
      start = getStartOfDay(new Date(today.setDate(today.getDate() - dayOfWeek)));
    } else if (filter === 'month') {
      start = getStartOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
    }

    setStartDate(start);
    setEndDate(end);
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const numberOfSales = sales.length;

  return (
    <PageLayout title="Resumen de Ventas" description="Filtra y visualiza las ventas por día, semana, mes o un rango de fechas personalizado.">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setDateRange('today')} className={`px-4 py-1.5 text-sm font-medium text-gray-700 rounded-md hover:bg-white hover:shadow-sm transition-all ${activeFilter === 'today' ? 'bg-white shadow-sm' : ''}`}>Hoy</button>
          <button onClick={() => setDateRange('week')} className={`px-4 py-1.5 text-sm font-medium text-gray-700 rounded-md hover:bg-white hover:shadow-sm transition-all ${activeFilter === 'week' ? 'bg-white shadow-sm' : ''}`}>Esta Semana</button>
          <button onClick={() => setDateRange('month')} className={`px-4 py-1.5 text-sm font-medium text-gray-700 rounded-md hover:bg-white hover:shadow-sm transition-all ${activeFilter === 'month' ? 'bg-white shadow-sm' : ''}`}>Este Mes</button>
        </div>
        <div className="flex items-center gap-4">
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
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
                <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
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
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ventas Totales</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">S/{totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Número de Transacciones</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{numberOfSales}</p>
        </div>
      </div>

      {/* Tabla de Ventas */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fecha</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Cliente</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={3} className="text-center py-12 text-gray-500">
                <div className="flex justify-center items-center gap-2"><svg className="animate-spin h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Cargando...</div>
              </td></tr>
            ) : sales.length > 0 ? (
              sales.map((sale, index) => (
                <tr key={sale.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(sale.fecha.seconds * 1000).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.nombreCliente}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-mono">S/{sale.total.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={3} className="text-center py-12 text-gray-500">
                <div className="flex flex-col items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>No hay ventas en el período seleccionado.</div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}

export default function ResumenPage() {
  return (
    <DashboardLayout>
      <Resumen />
    </DashboardLayout>
  );
}
