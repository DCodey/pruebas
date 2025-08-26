import api from './axiosConfig';

export interface Client {
    id: string;
    name: string;
    description: string;
    phone: string;
    document_number?: string;
}

// ✅ Obtener todos los clientes
export const getClients = async (): Promise<Client[]> => {
    const response = await api.get<{ success: boolean; data: Client[] }>('/clients');
    return response.data.data;
};

// ✅ Añadir un nuevo cliente
export const addClient = async (clientData: Omit<Client, 'id'>): Promise<string> => {
    const response = await api.post<{ success: boolean; data: Client }>('/clients', {
        name: clientData.name,
        description: clientData.description,
        phone: clientData.phone,
        document_number: clientData.document_number
    });

    return response.data.data.id;
};

// ✅ Actualizar un cliente existente
export const updateClient = async (
    id: string,
    clientData: Partial<Omit<Client, 'id'>>
): Promise<void> => {
    const updateData: Partial<Client> = {};
    if (clientData.name !== undefined) updateData.name = clientData.name;
    if (clientData.description !== undefined) updateData.description = clientData.description;
    if (clientData.phone !== undefined) updateData.phone = String(clientData.phone);
    if (clientData.document_number !== undefined) updateData.document_number = clientData.document_number;

    await api.put(`/clients/${id}`, updateData);
};

// ✅ Eliminar un cliente
export const deleteClient = async (id: string): Promise<{ message?: string }> => {
    const response = await api.delete(`/clients/${id}`);
    // Se asume que el backend responde con { success: true, message: '...' }
    return { message: response.data?.message };
};
