import api from './axiosConfig';

export interface PaymentMethod {
  id?: number;
  name: string;
  is_active: number;
}

// Obtener todos los metodos de pago
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get<{ success: boolean; data: PaymentMethod[] }>(
    '/payment-methods'
  );
  return response.data.data;
};

// Crear un nuevo metodo de pago
export const addPaymentMethod = async (paymentMethod: PaymentMethod): Promise<number> => {
  const response = await api.post<{ success: boolean; data: PaymentMethod }>(
    '/payment-methods',
    paymentMethod
  );
  return response.data.data.id!;
};

// Actualizar un metodo de pago
export const updatePaymentMethod = async (
  id: number,
  paymentMethod: Partial<Omit<PaymentMethod, 'id'>>
): Promise<void> => {
  await api.put(`/payment-methods/${id}`, paymentMethod);
};

// Eliminar un metodo de pago
export const deletePaymentMethod = async (id: number): Promise<{ message?: string }> => {
  const response = await api.delete(`/payment-methods/${id}`);
  return { message: response.data?.message };
};
