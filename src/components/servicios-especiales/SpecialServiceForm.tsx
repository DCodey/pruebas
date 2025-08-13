import React, { useState, useEffect } from 'react';
import type { SpecialService } from '../../services/specialService';
import { getClients, type Client } from '../../services/clientService';
import Checkbox from '../ui/Checkbox';

interface SpecialServiceFormProps {
  initialData?: Partial<SpecialService>;
  onSubmit: (formData: Omit<SpecialService, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function SpecialServiceForm({
  initialData = {
    startDate: new Date(),
    deceasedName: '',
    sector: '',
    description: '',
    isActive: true,
    isPaid: false,
    price: 0,
  },
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SpecialServiceFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  const [formData, setFormData] = useState<Omit<SpecialService, 'id' | 'createdAt' | 'updatedAt'>>({
    clientId: initialData.clientId || '',
    clientName: initialData.clientName || '',
    startDate: initialData.startDate || new Date(),
    isPaid: initialData.isPaid !== false,
    deceasedName: initialData.deceasedName || '',
    sector: initialData.sector || '',
    description: initialData.description || '',
    price: initialData.price || 0,
    isActive: initialData.isActive !== false, // Default to true if not specified
  });

  // Fetch clients on component mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsList = await getClients();
        setClients(clientsList);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setIsLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  // Update form data when client selection changes
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClientId = e.target.value;
    const selectedClient = clients.find(client => client.id === selectedClientId);
    
    setFormData(prev => ({
      ...prev,
      clientId: selectedClientId,
      clientName: selectedClient ? selectedClient.nombre : '',
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number'
          ? Number(value)
          : value,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        startDate: date,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate client is selected
    if (!formData.clientId) {
      alert('Por favor selecciona un cliente');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
          Cliente *
        </label>
        {isLoadingClients ? (
          <div className="mt-1 p-2 bg-gray-100 rounded-md animate-pulse">Cargando clientes...</div>
        ) : (
          <select
            id="clientId"
            name="clientId"
            value={formData.clientId}
            onChange={handleClientChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            required
          >
            <option value="">Selecciona un cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.nombre} - {client.celular}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label htmlFor="deceasedName" className="block text-sm font-medium text-gray-700">
          Nombre del Difunto *
        </label>
        <input
          type="text"
          id="deceasedName"
          name="deceasedName"
          value={formData.deceasedName}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          required
        />
      </div>

      <div>
        <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
          Nicho *
        </label>
        <input
          type="text"
          id="sector"
          name="sector"
          value={formData.sector}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          placeholder="Ejemplo: Jardines de la Paz, Bloque B, Fila 3, Columna 7, Nicho N.º 342"
          required
        />
      </div>

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
          Fecha de inicio *
        </label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
          onChange={(e) => handleDateChange(e.target.valueAsDate)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Detalles del Servicio *
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          placeholder="Ejemplo: Ramo de flores sencillas"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Precio (S/.) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            required
          />
        </div>
        <div className="flex items-end">
          <div className="flex items-center h-10">
            <Checkbox
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              label="Servicio Activo"
              labelClassName="text-sm text-gray-700"
              containerClassName="flex items-center"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
