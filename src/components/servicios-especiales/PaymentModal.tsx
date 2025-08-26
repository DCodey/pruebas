import React, { useState, useEffect } from 'react';
import PaymentReceiptModal from './PaymentReceiptModal';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import { getSpecialServiceById } from '../../services/specialService';
import { addPayment } from '../../services/paymentService';
import {
  addWeeks,
  addMonths,
  addYears,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  isSameMonth,
  isSameYear,
  eachMonthOfInterval,
  differenceInWeeks,
  differenceInMonths,
  parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';

interface Thursday {
  date: Date;
  formatted: string;
  isSelected: boolean;
  isDisabled: boolean;
  isPast: boolean;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceStartDate?: Date;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  serviceStartDate,
  onPaymentSuccess,
}) => {
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentFrequency, setPaymentFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [currentService, setCurrentService] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastPayment, setLastPayment] = useState<any>(null);
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState<string>('');
  const [thursdays, setThursdays] = useState<Thursday[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [availableMonths, setAvailableMonths] = useState<Date[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedPaymentMonth, setSelectedPaymentMonth] = useState<Date | null>(null);
  const [selectedPaymentWeek, setSelectedPaymentWeek] = useState<Date | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Generate available months for payment selection
  const generateAvailableMonths = () => {
    if (!serviceStartDate) return [];

    const start = new Date(serviceStartDate);
    const end = addMonths(start, 8); // Show 12 months from start date

    return eachMonthOfInterval({
      start,
      end
    });
  };

  // Generate available years for annual payment selection
  const generateAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const serviceYear = serviceStartDate
      ? new Date(serviceStartDate).getFullYear()
      : currentYear;

    const startYear = Math.min(currentYear, serviceYear); // el menor de los dos

    return Array.from({ length: 5 }, (_, i) => startYear + i);
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPaymentDate('');
      setError(null);
      setSelectedPaymentMonth(null);
      setAvailableYears(generateAvailableYears());

      if (serviceStartDate) {
        const start = new Date(serviceStartDate);
        setSelectedMonth(start);
        setAvailableMonths(generateAvailableMonths());
      } else {
        const today = new Date();
        setSelectedMonth(today);
        setAvailableMonths(generateAvailableMonths());
      }

      // Obtener el servicio actual para el cálculo del monto
      (async () => {
        try {
          const service = await getSpecialServiceById(Number(serviceId));
          setCurrentService(service);
        } catch (e) {
          setCurrentService(null);
        }
      })();
    }
  }, [isOpen, serviceStartDate, serviceId]);

  // Calcula el monto y periodos igual que el backend
  const calculatePeriodsAndAmount = (service: any) => {
    if (!service || !service.start_date) return { periods: 0, amount: 0 };
    let paymentDate: Date | null = null;
    if (paymentFrequency === 'weekly' && selectedPaymentWeek) {
      paymentDate = selectedPaymentWeek;
    } else if (paymentFrequency === 'monthly' && selectedPaymentMonth) {
      // Si el servicio es semanal pero el usuario selecciona meses, calcular semanas reales hasta fin de mes
      paymentDate = endOfMonth(selectedPaymentMonth);
    } else {
      return { periods: 0, amount: 0 };
    }
    const startDate = typeof service.start_date === 'string' ? parseISO(service.start_date) : new Date(service.start_date);
    const endDate = paymentDate;
    let periods = 1;
    if (currentService && currentService.recurrence_interval === 'weekly') {
      // Calcular semanas reales entre la fecha de inicio y la fecha de pago (fin de mes si es mensual)
      const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      periods = Math.ceil(diffDays / 7) + 1; // Siempre contar la semana seleccionada
      if (periods < 1) periods = 1;
    } else if (currentService && currentService.recurrence_interval === 'monthly') {
      // El backend cuenta el mes de inicio como 1 periodo si la fecha de pago está en el mismo mes o después
      periods = differenceInMonths(endDate, startDate) + 1;
      if (periods < 1) periods = 1;
    }
    const amount = +(periods * service.price).toFixed(2);
    return { periods, amount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // Obtener datos del servicio para el monto
      const currentService = await getSpecialServiceById(Number(serviceId));
      if (!currentService) {
        throw new Error('Servicio no encontrado');
      }

      // Determinar la fecha de pago según la frecuencia
      let payment_date = '';
      if (paymentFrequency === 'weekly' && selectedPaymentWeek) {
        payment_date = selectedPaymentWeek.toISOString().split('T')[0];
      } else if (paymentFrequency === 'monthly' && selectedPaymentMonth) {
        payment_date = endOfMonth(selectedPaymentMonth).toISOString().split('T')[0];
      } else if (paymentFrequency === 'yearly' && selectedYear) {
        payment_date = new Date(selectedYear, 0, 1).toISOString().split('T')[0];
      } else {
        setError('Selecciona una fecha válida para el pago.');
        setIsLoading(false);
        return;
      }

      // Calcular el monto según la frecuencia
      const { amount: amountToPay } = calculatePeriodsAndAmount(currentService);

      const paymentData = {
        service_id: Number(serviceId),
        amount: amountToPay,
        payment_date,
        payment_method: paymentMethod,
        transaction_reference: transactionReference,
        notes,
      };

  const newPayment = await addPayment(paymentData);
  setLastPayment(newPayment);
  setShowReceipt(true);
  onPaymentSuccess();
  // No cerrar el modal principal hasta que el usuario cierre el voucher
    } catch (error) {
      console.error('Error al registrar el pago:', error);
      setError('Ocurrió un error al registrar el pago. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get all Thursdays in the current month
  const getThursdaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const allDays = eachDayOfInterval({ start, end });
    const thursdays = allDays.filter(day => day.getDay() === 4); // 4 = Thursday

    return thursdays.map(thursday => {
      const serviceStart = serviceStartDate ? new Date(serviceStartDate) : null;
      const isBeforeServiceStart = serviceStart ? thursday < new Date(serviceStart.setHours(0, 0, 0, 0)) : false;
      const isPast = thursday < new Date(new Date().setHours(0, 0, 0, 0));
      return {
        date: thursday,
        formatted: format(thursday, 'dd/MM/yyyy'),
        isSelected: paymentDate ? isSameDay(thursday, new Date(paymentDate)) : false,
        isDisabled: isBeforeServiceStart,
        isPast
      };
    });
  };

  // Update Thursdays when month changes or payment frequency changes to weekly
  useEffect(() => {
    if (paymentFrequency === 'weekly') {
      setThursdays(getThursdaysInMonth(selectedMonth));
    }
  }, [selectedMonth, paymentFrequency]);


  // Handle month selection for payment
  const handleMonthSelect = (month: Date) => {
    setSelectedPaymentMonth(month);
    setPaymentDate(month.toISOString().split('T')[0]);
    setError(null);
  };

  // Handle year selection for annual payment
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    const firstDayOfYear = new Date(year, 0, 1);
    setPaymentDate(firstDayOfYear.toISOString().split('T')[0]);
    setError(null);
  };

  // Handle week selection
  const handleWeekSelect = (week: Date) => {
    setSelectedPaymentWeek(week);
    setPaymentDate(week.toISOString().split('T')[0]);
    setError(null);
  };

  // Check if a month is the currently selected payment month
  const isMonthSelected = (month: Date) => {
    return selectedPaymentMonth
      ? isSameMonth(month, selectedPaymentMonth) && isSameYear(month, selectedPaymentMonth)
      : false;
  };

  // Check if a year is the currently selected year
  const isYearSelected = (year: number) => {
    return year === selectedYear;
  };

  // Format month for display (e.g., 'Enero 2023')
  const formatMonth = (date: Date) => {
    return format(date, 'MMMM yyyy', { locale: es });
  };

  // Calculate valid until date based on payment frequency
  useEffect(() => {
    if (!paymentDate) {
      setValidUntil('');
      return;
    }

    const date = new Date(paymentDate);
    let newValidUntil: Date;

    switch (paymentFrequency) {
      case 'weekly':
        newValidUntil = addWeeks(date, 1);
        break;
      case 'monthly':
        newValidUntil = addMonths(date, 1);
        break;
      case 'yearly':
        newValidUntil = addYears(date, 1);
        break;
      default:
        newValidUntil = addWeeks(date, 1);
    }

    setValidUntil(format(newValidUntil, 'PPP', { locale: es }));
  }, [paymentDate, paymentFrequency]);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Render month selection view
  const renderMonthlyView = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Selecciona hasta qué mes deseas pagar:</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {availableMonths.map((month, index) => {
          const isSelected = isMonthSelected(month);
          // Deshabilitar meses anteriores a la fecha de inicio del servicio
          const isPast = serviceStartDate
            ? isBefore(month, startOfMonth(new Date(serviceStartDate)))
            : isBefore(month, startOfMonth(new Date()));

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleMonthSelect(month)}
              disabled={isPast}
              className={`relative flex items-center justify-center rounded-md border p-3 text-sm font-medium focus:outline-none ${isSelected
                ? 'bg-primary-100 border-primary-500 text-primary-700 z-10'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } ${isPast ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
            >
              {formatMonth(month)}
              {isSelected && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary-500" />
              )}
            </button>
          );
        })}
      </div>

      {selectedPaymentMonth && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Mes seleccionado:</span> {formatMonth(selectedPaymentMonth)}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Válido hasta el {validUntil}
          </p>
        </div>
      )}

      {serviceStartDate && (
        <p className="text-xs text-gray-500 mt-2">
          Fecha de inicio del servicio: {format(new Date(serviceStartDate), 'dd/MM/yyyy')}
        </p>
      )}
    </div>
  );

  const renderWeeklyView = () => {
    // Get all Thursdays in the current month
    const thursdays = getThursdaysInMonth(selectedMonth);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Selecciona hasta qué semana deseas pagar:</h3>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                const prevMonth = new Date(selectedMonth);
                prevMonth.setMonth(prevMonth.getMonth() - 1);
                setSelectedMonth(prevMonth);
              }}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              &larr;
            </button>
            <span className="text-sm font-medium">
              {format(selectedMonth, 'MMMM yyyy', { locale: es })}
            </span>
            <button
              type="button"
              onClick={() => {
                const nextMonth = new Date(selectedMonth);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                setSelectedMonth(nextMonth);
              }}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              &rarr;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {thursdays.map((thursday, index) => {
            const isDisabled = thursday.isDisabled || (serviceStartDate && isBefore(thursday.date, new Date(serviceStartDate)));
            const isPast = isBefore(thursday.date, new Date());
            const isSelected = selectedPaymentWeek ? isSameDay(thursday.date, selectedPaymentWeek) : false;

            return (
              <button
                key={index}
                type="button"
                onClick={() => !isDisabled && handleWeekSelect(thursday.date)}
                disabled={isDisabled}
                className={`relative flex flex-col items-center justify-center rounded-md border p-3 text-sm font-medium focus:outline-none ${isSelected
                  ? 'bg-primary-100 border-primary-500 text-primary-700 z-10'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                <span className={`text-sm ${isPast ? 'text-gray-500' : 'text-gray-800'}`}>
                  {format(thursday.date, 'dd')}
                </span>
                <span className="text-xs text-gray-500">
                  {format(thursday.date, 'MMM', { locale: es })}
                </span>
                {isSelected && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary-500" />
                )}
              </button>
            );
          })}
        </div>

        {selectedPaymentWeek && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Semana seleccionada:</span>{' '}
              {format(selectedPaymentWeek, 'dd MMMM yyyy', { locale: es })}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Válido hasta el {validUntil}
            </p>
          </div>


        )}

        {serviceStartDate && (
          <p className="text-xs text-gray-500 mt-2">
            Fecha de inicio del servicio: {format(new Date(serviceStartDate), 'dd/MM/yyyy')}
          </p>
        )}
      </div>
    );
  };

  // Render annual payment view
  const renderAnnualView = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Selecciona el año de pago:</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {availableYears.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => handleYearSelect(year)}
            className={`relative flex items-center justify-center rounded-md border p-4 text-sm font-medium focus:outline-none ${isYearSelected(year)
              ? 'bg-primary-100 border-primary-500 text-primary-700 z-10'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            {year}
            {isYearSelected(year) && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary-500" />
            )}
          </button>
        ))}
      </div>

      {selectedYear && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Pago anual seleccionado:</span>{' '}
            {selectedYear}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Válido hasta el 31 de diciembre de {selectedYear}
          </p>
        </div>
      )}

      {serviceStartDate && (
        <p className="text-xs text-gray-500 mt-2">
          Fecha de inicio del servicio: {format(new Date(serviceStartDate), 'dd/MM/yyyy')}
        </p>
      )}
    </div>
  );

  // Función para restaurar el formulario a su estado inicial
  const resetForm = () => {
    setPaymentDate('');
    setError(null);
    setSelectedPaymentMonth(null);
    setSelectedPaymentWeek(null);
    setSelectedYear(new Date().getFullYear());
    setPaymentFrequency('weekly');
    setPaymentMethod('cash');
    setTransactionReference('');
    setNotes('');
    setValidUntil('');
    setThursdays([]);
    setAvailableYears(generateAvailableYears());
    if (serviceStartDate) {
      const start = new Date(serviceStartDate);
      setSelectedMonth(start);
      setAvailableMonths(generateAvailableMonths());
    } else {
      const today = new Date();
      setSelectedMonth(today);
      setAvailableMonths(generateAvailableMonths());
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const modalFooter = (
    <div className="flex flex-col gap-y-2">
      <div className="mb-2 p-2 bg-blue-50 rounded-md border border-blue-200 text-blue-800 font-medium flex items-center justify-between">
        <span>Resumen a pagar:</span>
        <span>
          {(() => {
            if (!serviceId) return '---';
            if (
              (paymentFrequency === 'weekly' && selectedPaymentWeek) ||
              (paymentFrequency === 'monthly' && selectedPaymentMonth)
            ) {
              if (!serviceStartDate || !currentService) return '---';
              const { periods, amount: calcAmount } = calculatePeriodsAndAmount({ price: currentService.price, start_date: currentService.start_date });
              return `S/ ${calcAmount} (${periods} Semana(s))`;
            }
            return '---';
          })()}
        </span>
      </div>
      <div className="flex justify-end gap-x-3">
        <button
          type="button"
          onClick={handleCancel}
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
          Pagar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pago" footer={modalFooter}>
        <div className="mt-4">
          <form id="special-service-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
            <Select
              label="Forma de pago"
              id="paymentFrequency"
              value={paymentFrequency}
              onChange={(e) => setPaymentFrequency(e.target.value as 'weekly' | 'monthly')}
              options={[
                { value: 'weekly', label: 'Semanal' },
                { value: 'monthly', label: 'Mensual' },
              ]}
              containerClassName="mb-4"
            />


            {paymentFrequency === 'weekly' && (
              renderWeeklyView()
            )}

            {/* Month Selection */}
            {paymentFrequency === 'monthly' && availableMonths.length > 0 && (
              renderMonthlyView()
            )}

            {/* ...existing code... */}

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
          </form>
        </div>
      </Modal>
      {/* Voucher/Comprobante de pago */}
      <PaymentReceiptModal
        isOpen={showReceipt}
        onClose={() => {
          setShowReceipt(false);
          setLastPayment(null);
          onClose();
        }}
        payment={lastPayment}
        service={currentService}
      />
    </>
  );
};

export default PaymentModal;
