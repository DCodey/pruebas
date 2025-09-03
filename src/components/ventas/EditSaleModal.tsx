import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import { getPaymentMethods } from '../../services/PaymentMethodService';
import type { PaymentMethod } from '../../services/PaymentMethodService';
import { updateSale } from '../../services/saleService';
import { updateDateKeepingTime, toUTC5, setDateWithCurrentTimeIfChanged } from '../../utils/dateUtils';

interface EditSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: any;
  onUpdated: (updatedSale: any) => void;
}

const EditSaleModal: React.FC<EditSaleModalProps> = ({ isOpen, onClose, sale, onUpdated }) => {
  const [saleDate, setSaleDate] = useState('');
  const [originalDate, setOriginalDate] = useState<Date | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<number | ''>('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sale) {
      // Guardar la fecha original como objeto Date
      const dateObj = sale.sale_date ? new Date(sale.sale_date.replace(' ', 'T')) : null;
      setOriginalDate(dateObj);
      // Precargar solo la parte de fecha
      const dateOnly = sale.sale_date ? sale.sale_date.slice(0, 10) : '';
      setSaleDate(dateOnly);
      setPaymentMethodId(sale.payment_method?.id || '');
    }
  }, [sale]);

  useEffect(() => {
    getPaymentMethods().then(setPaymentMethods);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Mantener la hora actual si la fecha fue cambiada
      let newDateString = saleDate;
      if (originalDate && saleDate) {
        const updatedDate = setDateWithCurrentTimeIfChanged(originalDate, saleDate);
        const utc5 = toUTC5(updatedDate);
        newDateString = utc5.toISOString().slice(0, 19).replace('T', ' ');
      }
      await updateSale(sale.id, {
        client_id: sale.client_id ?? null,
        client_name: sale.client_name ?? null,
        sale_date: newDateString,
        payment_method_id: paymentMethodId as number,
        items: sale.items,
      });
      onUpdated({ ...sale, sale_date: newDateString, payment_method: paymentMethods.find(pm => pm.id === paymentMethodId) });
      onClose();
    } catch (err: any) {
      setError('Error al actualizar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Venta">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fecha de venta</label>
          <input
            type="date"
            className="w-full border rounded px-2 py-1"
            value={saleDate}
            onChange={e => setSaleDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Método de pago</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={paymentMethodId}
            onChange={e => setPaymentMethodId(Number(e.target.value))}
            required
          >
            <option value="">Selecciona un método</option>
            {paymentMethods.map(pm => (
              <option key={pm.id} value={pm.id}>{pm.name}</option>
            ))}
          </select>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSaleModal;
