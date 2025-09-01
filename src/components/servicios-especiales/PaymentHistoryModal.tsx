import React, { useEffect, useState } from 'react';
import PaymentReceiptModal from './PaymentReceiptModal';
import { getSpecialServiceById } from '../../services/specialService';
import Modal from '../ui/Modal';
import type { Payment } from '../../services/paymentService';
import { getPayments } from '../../services/paymentService';
import Loader from '../ui/Loader';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatDateToDisplay } from 'src/utils/dateUtils';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: number;
  serviceName: string;
  clientName: string;
  deceasedName: string;
  price: number;
  isPaid: boolean;
}

export default function PaymentHistoryModal({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  clientName,
  deceasedName,
  price,
  isPaid
}: PaymentHistoryModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [serviceData, setServiceData] = useState<any>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!isOpen || !serviceId) return;
      try {
        setIsLoading(true);
        setError(null);
        const paymentsData = await getPayments(serviceId);
        setPayments(paymentsData);
        // Cargar datos del servicio para el voucher
        const service = await getSpecialServiceById(serviceId);
        setServiceData(service);
      } catch (err) {
        console.error('Error al cargar el historial de pagos:', err);
        setError('No se pudo cargar el historial de pagos. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, [isOpen, serviceId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Historial de Pagos - ${clientName || 'Cliente'}`}
        size="lg"
      >
        <div className="pb-2">
          <div className="space-y-4">
            <div className="mt-2">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader />
                </div>
              ) : error ? (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay registros de pago</p>
                </div>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-white shadow overflow-hidden sm:rounded-md ring-1 ring-secondary-200 shadow-secondary-200 mb-2 cursor-pointer hover:bg-blue-50 transition"
                    onClick={() => { setSelectedPayment(payment); setShowReceipt(true); }}
                  >
                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                      <div>
                        <div className='text-gray-700 text-sm'> {formatDateToDisplay(payment.payment_start_date)} </div>
                        <div className='text-gray-700 text-sm'> {formatDateToDisplay(payment.payment_end_date)}</div>
                        {payment.notes && (
                          <p className="mt-1 text-sm text-gray-500">{payment.notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        <button
                          className="text-xs text-primary-600 hover:underline border border-primary-200 rounded px-2 py-1 mt-1"
                          onClick={e => { e.stopPropagation(); setSelectedPayment(payment); setShowReceipt(true); }}
                        >
                          Ver voucher
                        </button>
                      </div>
                    </div>
                  </div>
                )))}
            </div>
          </div>
        </div>
      </Modal>
      {/* Voucher/Comprobante de pago */}
      <PaymentReceiptModal
        isOpen={showReceipt}
        onClose={() => { setShowReceipt(false); setSelectedPayment(null); }}
        payment={selectedPayment}
        service={serviceData}
      />
    </>
  );
}
