import React, { useRef } from 'react';
import Modal from '../ui/Modal';
import type { Sale } from '../../services/saleService';
import html2canvas from 'html2canvas';
import { DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import { COMPANY } from 'src/utils/constants';
import { generateDisplayCode } from 'src/utils/helper';

interface SaleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({ isOpen, onClose, sale }) => {
  if (!sale) return null;

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateString).toLocaleDateString('es-PE', options);
  };

  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    
    try {
      // Show loading state
      const shareButton = document.querySelector('button[onClick*="handleDownloadReceipt"]');
      if (shareButton) {
        shareButton.innerHTML = '<span>Descargando imagen...</span>';
        shareButton.setAttribute('disabled', 'true');
      }
      
      // Store original styles
      const productNames = receiptRef.current.querySelectorAll('.product-name');
      const originalStyles: { element: Element; style: string }[] = [];
      
      // Ensure text is visible in the screenshot
      productNames.forEach(el => {
        originalStyles.push({
          element: el,
          style: (el as HTMLElement).style.cssText
        });
        (el as HTMLElement).style.color = '#000000';
        (el as HTMLElement).style.fontWeight = '500';
        (el as HTMLElement).style.fontSize = '14px';
        (el as HTMLElement).style.whiteSpace = 'normal';
        (el as HTMLElement).style.overflow = 'visible';
        (el as HTMLElement).style.textOverflow = 'clip';
      });
      
      // Create canvas with higher resolution for better quality
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Ensure cloned elements have proper styles
          const clonedProductNames = clonedDoc.querySelectorAll('.product-name');
          clonedProductNames.forEach(el => {
            (el as HTMLElement).style.color = '#000000';
            (el as HTMLElement).style.fontWeight = '500';
            (el as HTMLElement).style.fontSize = '14px';
            (el as HTMLElement).style.whiteSpace = 'normal';
            (el as HTMLElement).style.overflow = 'visible';
            (el as HTMLElement).style.textOverflow = 'clip';
          });
        }
      });
      
      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 1);
      });
      
      if (!blob) {
        throw new Error('No se pudo generar la imagen');
      }
      
      // Create a File object from the Blob
      const file = new File([blob], 'comprobante.png', { type: 'image/png' });
      
      // Create a shareable URL for the file
      const fileUrl = URL.createObjectURL(file);
      
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `comprobente_${sale?.id || ''}_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Restore original styles
      originalStyles.forEach(({ element, style }) => {
        (element as HTMLElement).style.cssText = style;
      });
    } catch (error) {
      console.error('Error al generar la imagen:', error);
      alert('No se pudo generar la imagen para compartir. Por favor, intente imprimir el comprobante.');
    } finally {
      // Reset button state
      const shareButton = document.querySelector('button[onClick*="handleDownloadReceipt"]');
      if (shareButton) {
        shareButton.innerHTML = `
          Descargar
        `;
        shareButton.removeAttribute('disabled');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Comprobante de Venta"
      footer={
        <div className="flex justify-center gap-4">
          <button
            onClick={handleDownloadReceipt}            
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
           <DocumentArrowDownIcon className="h-4 w-4" />
            Descargar
          </button>
        </div>
      }
    >
      <div ref={receiptRef} className="bg-gray-50 max-w-xs mx-auto p-6 font-mono print:p-0 print:shadow-none" style={{ WebkitPrintColorAdjust: 'exact' }}>
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">{COMPANY.name}</h2>
          <p className="text-xs text-gray-600">{COMPANY.description}</p>
          <p className="text-xs mt-1">--------------------------------</p>
        </div>
        
        {/* Sale Info */}
        <div className="mb-4">
          <div className="flex justify-between text-xs">
            <span className="font-semibold">COMPROBANTE:</span>
            <span>{generateDisplayCode(sale.id, '#SALE')}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold">FECHA:</span>
            <span>{formatDate(sale.sale_date)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold">CLIENTE:</span>
            <span>{sale.client_name || 'Cliente ocasional'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold">PAGO:</span>
            <span className="uppercase">{sale.payment_method?.name}</span>
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-b border-dashed border-gray-300 py-2 my-2">
          <div className="grid grid-cols-12 text-xs font-semibold mb-1">
            <div className="col-span-6">DESCRIPCIÓN</div>
            <div className="col-span-2 text-right">CANT</div>
            <div className="col-span-4 text-right">IMPORTE</div>
          </div>
          
          {sale.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 text-xs py-1">
              <div className="col-span-6 truncate product-name" style={{ color: '#000000' }}>{item.product_name || 'Producto'}</div>
              <div className="col-span-2 text-right">{item.quantity}</div>
              <div className="col-span-4 text-xs text-right text-gray-600">S/ {item.price}</div>
              <div className="col-span-6"></div>
              <div className="col-span-6 text-right">
                S/ {(item.quantity * item.price).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-3 text-right">
          <div className="flex justify-between text-sm font-semibold">
            <span>TOTAL:</span>
            <span>S/ {sale.total}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Incluye IGV
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>¡Gracias por su compra!</p>
          <p className="mt-1">*** Venta no reembolsable ***</p>
          <p className="mt-4 text-[10px]">
          © {new Date().getFullYear()} {COMPANY.footer}
          </p>
        </div>       
      </div>
    </Modal>
  );
};

export default SaleDetailsModal;
