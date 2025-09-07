import React, { useRef } from 'react';
import Modal from '../ui/Modal';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import type { Payment } from '../../services/paymentService';
import type { SpecialService } from '../../services/specialService';
import { calculatePaymentPeriodsAndAmount } from '../../utils/paymentUtils';
import { formatDateToDisplay } from 'src/utils/dateUtils';
import { generateDisplayCode } from 'src/utils/helper';
import { useCompany } from 'src/contexts/CompanyContext';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  service: SpecialService | null;
}

const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ isOpen, onClose, payment, service }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { data: company } = useCompany();

  if (!payment || !service) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
  };

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { scale: 3, backgroundColor: '#fff' });
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprobante_pago_servicio_${payment.id}.png`;
    link.click();
  };

  // Calcular periodos pagados usando el helper reutilizable
  let periodos = 1;
  let tipoPeriodo = 'mes(es)';
  if (service && (service.recurrence_interval === 'weekly' || service.recurrence_interval === 'monthly')) {
    const { periods } = calculatePaymentPeriodsAndAmount({
      startDate: payment.payment_start_date,
      endDate: payment.payment_end_date,
      recurrenceInterval: service.recurrence_interval,
      price: 1 // El monto no importa aquí, solo queremos los periodos
    });
    periodos = periods;
    tipoPeriodo = service.recurrence_interval === 'weekly' ? 'semana(s)' : 'mes(es)';
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comprobante de Pago" footer={
      <div className="flex justify-center gap-4">
        <button
          onClick={handleDownloadReceipt}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <DocumentArrowDownIcon className="h-4 w-4" /> Descargar
        </button>
      </div>
    }>
      <div ref={receiptRef} className="bg-gray-50 max-w-xs mx-auto p-6 font-mono print:p-0 print:shadow-none" style={{ WebkitPrintColorAdjust: 'exact' }}>
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">{company?.app_name}</h2>
          <p className="text-xs text-gray-600">{company?.app_description}</p>
          <p className="text-xs mt-1">--------------------------------</p>
        </div>
        {/* Info */}
        <div className="mb-4">
          <div className="flex justify-between text-xs">
            <span className="font-semibold">COMPROBANTE:</span>
            <span>{generateDisplayCode(payment.id, '#PAYMENT')}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold">FECHA:</span>
            <span>{formatDate(payment.created_at)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold">CLIENTE:</span>
            <span>{service.client?.name || '-'}</span>
          </div>          
        </div>
        {/* Detalle */}
        <div className="border-t border-b border-dashed border-gray-300 py-2 my-2">
          <div className="flex justify-between text-xs">
            <span>Descripción:</span>
            <span>{service.description || '-'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Fecha inicio :</span>
            <span>{formatDateToDisplay(payment.payment_start_date)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Fecha fin :</span>
            <span>{formatDateToDisplay(payment.payment_end_date)}</span>
          </div>
          
          <div className="flex justify-between text-xs mt-2">
            <span>Periodo pagado:</span>
            <span>{periodos} {tipoPeriodo}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Monto pagado:</span>
            <span>S/ {payment.amount.toFixed(2)}</span>
          </div>
        </div>
        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>¡Gracias por su pago!</p>
          <p className="mt-1">*** Pago no reembolsable ***</p>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentReceiptModal;
