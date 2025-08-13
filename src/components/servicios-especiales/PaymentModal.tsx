import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Checkbox from '../ui/Checkbox';
import { updateSpecialService, getSpecialService } from '../../services/specialService';
import Loader from '../ui/Loader';
import { addWeeks, addMonths, addYears, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, isAfter, addDays } from 'date-fns';
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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPaymentDate('');
      setError(null);
      // Set initial month to service start date if available
      if (serviceStartDate) {
        setSelectedMonth(new Date(serviceStartDate));
      } else {
        setSelectedMonth(new Date()); // Reset to current month if no start date
      }
    }
  }, [isOpen, serviceStartDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isPaid = paymentDate >= today;
    
    if (!paymentDate) {
      setError('Por favor selecciona una fecha');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const selectedDate = new Date(paymentDate);
      let validUntilDate: Date;

      switch (paymentFrequency) {
        case 'weekly':
          validUntilDate = addWeeks(selectedDate, 1);
          break;
        case 'monthly':
          validUntilDate = addMonths(selectedDate, 1);
          break;
        case 'yearly':
          validUntilDate = addYears(selectedDate, 1);
          break;
        default:
          validUntilDate = addWeeks(selectedDate, 1);
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

  // Handle month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(direction === 'prev' ? prev.getMonth() - 1 : prev.getMonth() + 1);
      return newMonth;
    });
  };

  // Handle Thursday selection
  const handleThursdaySelect = (selectedDate: Date, isSelected: boolean) => {
    // Check if the selected date is before the service start date
    if (serviceStartDate) {
      const startDate = new Date(serviceStartDate);
      startDate.setHours(0, 0, 0, 0);
      if (isBefore(selectedDate, startDate)) {
        setError('No puedes seleccionar una fecha anterior al inicio del servicio');
        return;
      }
    }

    // For single selection mode
    if (isSelected) {
      setPaymentDate(selectedDate.toISOString().split('T')[0]);
      setError(null);
      
      // Update Thursdays with new selection
      setThursdays(prev => 
        prev.map(thursday => ({
          ...thursday,
          isSelected: isSameDay(thursday.date, selectedDate) ? isSelected : false
        }))
      );
    }
  };

  // Handle date input change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const date = new Date(selectedDate);
    
    if (serviceStartDate) {
      const startDate = new Date(serviceStartDate);
      startDate.setHours(0, 0, 0, 0);
      if (date < startDate) {
        setError('No puedes seleccionar una fecha anterior al inicio del servicio');
        return;
      }
    }
    
    setPaymentDate(selectedDate);
    setError(null);
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

  // Get current month and year for display
  const currentMonthYear = format(selectedMonth, 'MMMM yyyy', { locale: es });
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pago">
      <div className="mt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
              Frecuencia de Pago *
            </label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { value: 'weekly', label: 'Semanal' },
                { value: 'monthly', label: 'Mensual' },
                { value: 'yearly', label: 'Anual' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPaymentFrequency(option.value as 'weekly' | 'monthly' | 'yearly')}
                  className={`py-2 px-3 rounded-md text-sm font-medium ${
                    paymentFrequency === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {paymentFrequency === 'weekly' ? (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Jueves de {currentMonthYear}</h3>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => navigateMonth('prev')}
                      className="p-1 rounded-full hover:bg-gray-100"
                      title="Mes anterior"
                    >
                      &larr;
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateMonth('next')}
                      className="p-1 rounded-full hover:bg-gray-100"
                      title="Siguiente mes"
                    >
                      &rarr;
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                  {thursdays.map((thursday) => {
                    const isDisabled = thursday.isDisabled || (serviceStartDate && isBefore(thursday.date, new Date(serviceStartDate)));
                    const isPast = isBefore(thursday.date, new Date());
                    
                    return (
                      <div 
                        key={thursday.formatted} 
                        className={`flex items-center p-2 rounded-md ${isDisabled ? 'opacity-60' : 'hover:bg-gray-50'}`}
                      >
                        <Checkbox
                          id={`thursday-${thursday.formatted}`}
                          checked={thursday.isSelected}
                          onChange={(e) => handleThursdaySelect(thursday.date, e.target.checked)}
                          disabled={isDisabled}
                          label={
                            <span className={`text-sm ${isPast ? 'text-gray-500' : 'text-gray-800'}`}>
                              {thursday.formatted}
                              {isPast && !isDisabled && ' (pasado)'}
                            </span>
                          }
                          containerClassName="w-full"
                          labelClassName={`ml-2 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        />
                      </div>
                    );
                  })}
                </div>
                {serviceStartDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Fecha de inicio del servicio: {format(new Date(serviceStartDate), 'dd/MM/yyyy')}
                  </p>
                )}
              </div>
            ) : (
              <>
                <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Pago *
                </label>
                <input
                  type="date"
                  id="paymentDate"
                  value={paymentDate}
                  onChange={handleDateChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm mb-4"
                  min={serviceStartDate ? format(new Date(serviceStartDate), 'yyyy-MM-dd') : undefined}
                  max={today}
                  required
                />
              </>
            )}

            {validUntil && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      El pago será válido hasta el: <span className="font-semibold">{validUntil}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="mr-2">
                    <Loader />
                  </span>
                  Procesando...
                </>
              ) : (
                'Registrar Pago'
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PaymentModal;
