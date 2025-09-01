import api from './axiosConfig';

// Estructura que se espera del backend
export interface SpecialService {
    id: number;
    client: {
        id: number,
        name: string,
    };
    name: string;
    deceased_name: string;
    description: string;
    price: number;
    is_active: boolean;
    is_paid: boolean;
    recurrence_interval?: 'weekly' | 'monthly';
    day_of_week?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | null;
    day_of_month?: number | null;
    sector: string;
    start_date: string | Date;
    end_date?: string | Date;
    last_payment_date?: string | Date;
}

// Estructura que se envia al backend
export interface NewSpecialServiceData {
    client_id: number;
    name: string;
    deceased_name: string;
    description: string;
    price: number;
    is_active: boolean;
    is_paid: boolean;
    recurrence_interval?: 'weekly' | 'monthly';
    day_of_week?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | null;
    day_of_month?: number | null;
    sector: string;
    start_date: string | Date;
    end_date?: string | Date;
}

// ✅ Obtener todos los servicios
export const getSpecialServices = async (): Promise<SpecialService[]> => {
    const response = await api.get<{ success: boolean; data: SpecialService[] }>('/services');
    return response.data.data;
};

// ✅ Obtener un servicio por ID
export const getSpecialServiceById = async (id: number): Promise<SpecialService> => {
    const response = await api.get<{ success: boolean; data: SpecialService }>(`/services/${id}`);
    return response.data.data;
};

// ✅ Añadir un nuevo servicio
export const addSpecialService = async (specialServiceData: NewSpecialServiceData): Promise<SpecialService> => {
    const response = await api.post<{
        success: boolean;
        message: string;
        data: SpecialService
    }>('/services', specialServiceData);

    return response.data.data;
};

// ✅ Actualizar un servicio
export const updateSpecialService = async (id: number, specialServiceData: NewSpecialServiceData): Promise<SpecialService> => {
    const updateData: any = {};

    // Map the flat structure to the nested client structure if client_id is provided
    if (specialServiceData.client_id !== undefined) {
        updateData.client_id = specialServiceData.client_id;
    }

    // Map other fields
    if (specialServiceData.name !== undefined) updateData.name = specialServiceData.name;
    if (specialServiceData.deceased_name !== undefined) updateData.deceased_name = specialServiceData.deceased_name;
    if (specialServiceData.description !== undefined) updateData.description = specialServiceData.description;
    if (specialServiceData.price !== undefined) updateData.price = specialServiceData.price;
    if (specialServiceData.is_active !== undefined) updateData.is_active = specialServiceData.is_active;
    if (specialServiceData.is_paid !== undefined) updateData.is_paid = specialServiceData.is_paid;
    if (specialServiceData.recurrence_interval !== undefined) updateData.recurrence_interval = specialServiceData.recurrence_interval;
    if (specialServiceData.day_of_week !== undefined) updateData.day_of_week = specialServiceData.day_of_week;
    if (specialServiceData.day_of_month !== undefined) updateData.day_of_month = specialServiceData.day_of_month;
    if (specialServiceData.sector !== undefined) updateData.sector = specialServiceData.sector;
    if (specialServiceData.start_date !== undefined) updateData.start_date = specialServiceData.start_date;
    if (specialServiceData.end_date !== undefined) updateData.end_date = specialServiceData.end_date;

    const response = await api.put<{
        success: boolean;
        message: string;
        data: SpecialService
    }>(`/services/${id}`, updateData);

    if (response.data.success) {
        return response.data.data;
    } else {
        throw new Error(response.data.message || 'Error al actualizar el servicio especial');
    }
};

// ✅ Eliminar un servicio
export const deleteSpecialService = async (id: number): Promise<void> => {
    await api.delete(`/services/${id}`);
};

// ✅ Eliminar definitivamente un servicio
export const deleteDefinitiveSpecialService = async (id: number): Promise<void> => {
    await api.delete(`/services/${id}`);
};
