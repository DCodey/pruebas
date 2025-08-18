import api from './axiosConfig';

export interface Sale {
    id: number;
    client_name: string | null;
    sale_date: string;
    total: number;
    payment_method: String;
    items: SaleItem[];
}

export interface SaleItem {
    product_id: number | null;
    product_name: string | null;
    price: number,
    quantity: number;
    subtotal: number;
}

export interface NewSaleData {
    client_id: number | null;
    client_name: string | null;
    sale_date: string;
    payment_method: String;
    items: SaleItem[];
}

export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Yape' | 'Plin' | 'Lemon';

// ✅ Obtener todos los productos
export const getSales = async (): Promise<Sale[]> => {
    const response = await api.get<{ success: boolean; data: Sale[] }>('/sales');
    return response.data.data;
};

// ✅ Añadir una nueva venta
export const addSale = async (saleData: NewSaleData): Promise<number> => {
    const response = await api.post<{ success: boolean; data: Sale }>('/sales', {
        client_id: saleData.client_id,
        client_name: saleData.client_name,
        sale_date: saleData.sale_date,
        payment_method: saleData.payment_method,
        items: saleData.items,
    });

    return response.data.data.id;
};

// ✅ Actualizar una venta
export const updateSale = async (saleId: number, saleData: NewSaleData): Promise<number> => {
    const response = await api.put<{ success: boolean; data: Sale }>(`/sales/${saleId}`, {
        client_id: saleData.client_id,
        client_name: saleData.client_name,
        sale_date: saleData.sale_date,
        payment_method: saleData.payment_method,
        items: saleData.items,
    });

    return response.data.data.id;
};

// ✅ Eliminar una venta
export const deleteSale = async (saleId: number): Promise<void> => {
    await api.delete(`/sales/${saleId}`);
};

// ✅ Obtener una venta por ID
export const getSaleById = async (saleId: number): Promise<Sale> => {
    const response = await api.get<{ success: boolean; data: Sale }>(`/sales/${saleId}`);
    return response.data.data;
};
