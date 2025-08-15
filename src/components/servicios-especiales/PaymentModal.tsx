import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Select from '../ui/Select';
import { updateSpecialService, getSpecialService } from '../../services/firebase/specialService';
import Loader from '../ui/Loader';
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
    }
  }, [isOpen, serviceStartDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPaymentMonth) {
      setError('Por favor selecciona un mes de pago');
      return;
    }

    // Set payment date to the first day of the selected month
    const paymentDate = startOfMonth(selectedPaymentMonth).toISOString().split('T')[0];
    let isPaid = new Date(paymentDate) >= new Date(today);

    // Clear any previous errors
    setError(null);

    try {
      setIsLoading(true);
      setError(null);

      const selectedDate = startOfMonth(new Date(paymentDate));
      let validUntilDate: Date;

      // Always set valid until to the end of the selected month
      validUntilDate = endOfMonth(selectedDate);

      // For yearly payments, add 1 year to the end of the selected month
      if (paymentFrequency === 'yearly') {
        validUntilDate = addYears(validUntilDate, 1);
      }

      // Format dates for Firestore
      const now = new Date();
      const paymentData = {
        isPaid: isPaid,
        paymentDate: selectedDate,
        validUntil: validUntilDate,
        paymentFrequency: paymentFrequency,
        updatedAt: now
      };

      console.log('Updating payment with data:', paymentData);

      // First get the current service data
      const currentService = await getSpecialService(serviceId);

      if (!currentService) {
        throw new Error('Servicio no encontrado');
      }

      // Update the service with payment data
      await updateSpecialService(serviceId, {
        ...currentService,
        ...paymentData,
        // Ensure these fields are properly formatted
        startDate: currentService.startDate,
        deceasedName: currentService.deceasedName,
        clientName: currentService.clientName,
        clientId: currentService.clientId,
        sector: currentService.sector,
        price: currentService.price,
        isActive: currentService.isActive !== false,
        description: currentService.description || ''
      });

      onPaymentSuccess();
      onClose();
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

  const modalFooter = (
    <div className="flex justify-end gap-x-3">
      <button
        type="button"
        onClick={onClose}
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
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pago" footer={modalFooter}>
      <div className="mt-4">
        <form id="special-service-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Select
              label="Forma de pago"
              id="paymentFrequency"
              value={paymentFrequency}
              onChange={(e) => setPaymentFrequency(e.target.value as 'weekly' | 'monthly' | 'yearly')}
              options={[
                { value: 'weekly', label: 'Semanal' },
                { value: 'monthly', label: 'Mensual' },
                { value: 'yearly', label: 'Anual' },
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

            {paymentFrequency === 'yearly' && renderAnnualView()}

            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PaymentModal;
