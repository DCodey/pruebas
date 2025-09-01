import React, { useRef } from 'react';
import Modal from './Modal';
import html2canvas from 'html2canvas';
import { DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import { COMPANY } from 'src/utils/constants';

interface VoucherBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  receiptId: string;
  date: string;
  client: string;
  serviceOrSale: string;
  paymentMethod: string;
  details: React.ReactNode;
  footerNote?: string;
  headerNote?: string;
}

const VoucherBase: React.FC<VoucherBaseProps> = ({
  isOpen,
  onClose,
  title,
  receiptId,
  date,
  client,
  serviceOrSale,
  paymentMethod,
  details,
  footerNote,
  headerNote
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { scale: 3, backgroundColor: '#fff' });
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprobante_${receiptId}.png`;
    link.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={
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
          <h2 className="text-xl font-bold">{COMPANY.name}</h2>
          <p className="text-xs text-gray-600">{headerNote || COMPANY.description}</p>
          <p className="text-xs mt-1">--------------------------------</p>
        </div>
        {/* Info */}
        <div className="mb-4">
          <div className="flex justify-between text-xs">
            <span className="font-semibold">COMPROBANTE:</span>
            <span>{receiptId}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold">FECHA:</span>
            <span>{date}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold">CLIENTE:</span>
            <span>{client}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold">{serviceOrSale.includes('Servicio') ? 'SERVICIO:' : 'PAGO:'}</span>
            <span>{serviceOrSale}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold">PAGO:</span>
            <span className="uppercase">{paymentMethod}</span>
          </div>
        </div>
        {/* Detalle */}
        {details}
        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>{footerNote || '¡Gracias por su preferencia!'}</p>
          <p className="mt-1">*** No reembolsable ***</p>
          <p className="mt-4 text-[10px]">
          © {new Date().getFullYear()} {COMPANY.footer}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default VoucherBase;
