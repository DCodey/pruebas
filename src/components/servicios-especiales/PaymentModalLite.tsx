import React, { useState, useEffect } from 'react';
import { calculatePaymentPeriodsAndAmount } from '../../utils/paymentUtils';
import Modal from '../ui/Modal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface PaymentModalLiteProps {
  isOpen: boolean;
  onClose: () => void;
  serviceStartDate: string | Date;
  serviceEndDate: string | Date;
  lastPaymentDate?: string | Date | null;
  recurrenceInterval: 'weekly' | 'monthly';
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | null;
  dayOfMonth: number | null;
  price: number;
  onPayment: (data: { startDate: string; endDate: string; amount: number; notes: string }) => void;
}

const PaymentModalLite: React.FC<PaymentModalLiteProps> = ({
  isOpen,
  onClose,
  serviceStartDate,
  serviceEndDate,
  lastPaymentDate,
  recurrenceInterval,
  dayOfWeek,
  dayOfMonth,
  price,
  onPayment,
}) => {
  // Calcular cantidad de periodos y monto
  const [summary, setSummary] = useState<{periods: number, amount: number}>({periods: 0, amount: 0});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEndDate('');
    setError(null);
    if (lastPaymentDate) {
      // Si hay un pago previo, establecer la fecha de inicio al día siguiente al último pago
      const nextDay = new Date(lastPaymentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setStartDate(format(nextDay, 'yyyy-MM-dd'));
    } else if (serviceStartDate) {
      // Si es el primer pago, usar la fecha de inicio del servicio
      setStartDate(format(new Date(serviceStartDate), 'yyyy-MM-dd'));
    } else {
      setStartDate('');
    }
  };

  // Establecer la fecha de inicio inicial basada en si hay pagos previos
  useEffect(() => {
    resetForm();
  }, [lastPaymentDate, serviceStartDate, isOpen]);

  useEffect(() => {
      setSummary(
        calculatePaymentPeriodsAndAmount({
          startDate,
          endDate,
          recurrenceInterval,
          price
        })
      );
    }, [startDate, endDate, recurrenceInterval, price]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Por favor selecciona ambas fechas.');
      return;
    }
    
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (startDateObj > endDateObj) {
      setError('La fecha de inicio no puede ser mayor que la fecha de fin.');
      return;
    }
    
    if (lastPaymentDate) {
      const lastPaymentDateObj = new Date(lastPaymentDate);
      if (startDateObj < lastPaymentDateObj) {
        setError(`La fecha de inicio debe ser posterior a la última fecha de pago (${format(lastPaymentDateObj, 'dd/MM/yyyy', { locale: es })}).`);
        return;
      }
    }
    setError(null);
    const notes = `Pago por ${summary.periods} ${recurrenceInterval === 'weekly' ? 'semana(s)' : 'mes(es)'}`;
    onPayment({ startDate, endDate, amount: summary.amount, notes });
    handleClose();
  };

  const modalFooter = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
      <div className="p-3 bg-blue-50 rounded-md border border-blue-200 text-center sm:text-left">
        <div className="text-sm text-blue-700">
          <span className="font-medium"></span> {summary.periods > 0 ? `${summary.periods} ${recurrenceInterval === 'weekly' ? 'semana(s)' : 'mes(es)'} = ` : ''}
          <span className="font-bold">S/ {summary.amount}</span>
        </div>
      </div>
      <div className="flex justify-end gap-x-3">
        <button
          type="button"
          onClick={handleClose}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="payment-form"
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          Registrar Pago
        </button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Pago" footer={modalFooter}>
      <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4 p-2">
          <div>
            <p className="text-xs text-gray-400">Inicio del servicio</p>
            <p className="text-sm font-medium text-gray-600">{serviceStartDate ? format(new Date(serviceStartDate), 'dd/MM/yyyy', { locale: es }) : '---'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Fecha último pago</p>
            <p className="text-sm font-medium text-gray-600">{serviceEndDate ? format(new Date(serviceEndDate), 'dd/MM/yyyy', { locale: es }) : '---'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Precio de servicio</p>
            <p className="text-sm font-medium text-gray-600">S/ {price}</p>
          </div>
        </div>
        
        <div className='border border-gray-200 p-2 rounded-lg bg-white'>
          <label className="block text-sm font-medium text-gray-700 mb-2">Periodo a pagar</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="date"
                placeholder="Inicio"
                className="p-2 block w-full rounded-md border border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={startDate}
                min={lastPaymentDate 
                  ? format(new Date(lastPaymentDate), 'yyyy-MM-dd')
                  : serviceStartDate 
                    ? format(new Date(serviceStartDate), 'yyyy-MM-dd')
                    : format(new Date(), 'yyyy-MM-dd')}
                onChange={e => {
                  setStartDate(e.target.value);
                  // Reset end date if it's before the new start date
                  if (endDate && new Date(e.target.value) > new Date(endDate)) {
                    setEndDate('');
                  }
                }}
                required
              />
            </div>
            <div className="relative">
              <input
                type="date"
                placeholder="Fin"
                className="p-2 block w-full rounded-md border border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={endDate}
                min={startDate || (serviceStartDate ? format(new Date(serviceStartDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'))}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </Modal>
  );
};

export default PaymentModalLite;
