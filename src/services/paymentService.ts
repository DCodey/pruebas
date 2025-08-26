import api from './axiosConfig';

export interface Payment {
  id: number;
  service_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_reference: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface NewPaymentData {
  service_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  transaction_reference: string;
  notes: string;
}

// ✅ Obtener todos los pagos
export const getPayments = async (id: number): Promise<Payment[]> => {
  const response = await api.get<{ success: boolean; data: Payment[] }>(`/services/${id}/payments`);
  return response.data.data;
};

// ✅ Añadir un nuevo pago
export const addPayment = async (paymentData: NewPaymentData): Promise<Payment> => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: Payment
  }>('/payments', paymentData);

  return response.data.data;
};