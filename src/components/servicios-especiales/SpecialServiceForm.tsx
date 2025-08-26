import React, { useState, useEffect } from 'react';
import type { SpecialService, NewSpecialServiceData } from '../../services/specialService';
import type { Client } from '../../services/clientService';
import { getClients } from '../../services/clientService';
import Loader from '../ui/Loader';

type FormData = Omit<NewSpecialServiceData, 'client_id'> & {
  client_id: number | '';
  name: string; // Add missing required field
  sector: string; // Add missing required field
  recurrence_interval: 'weekly' | 'monthly'; // Make it more specific
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | null;
  day_of_month: number | null;
};

interface SpecialServiceFormProps {
  initialData?: Partial<SpecialService>;
  onSubmit: (formData: NewSpecialServiceData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function SpecialServiceForm({
  initialData = {
    client: {
      id: 0,
      name: '',
    },
    start_date: new Date(),
    deceased_name: '',
    sector: '',
    description: '',
    recurrence_interval: 'weekly',
    day_of_week: null,
    day_of_month: null,
    is_active: true,
    is_paid: false,
    price: 0,
  },
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SpecialServiceFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  const [formData, setFormData] = useState<FormData>(() => ({
    client_id: initialData.client?.id || '',
    name: initialData.name || 'Flores puesta en tierra',
    deceased_name: initialData.deceased_name || '',
    description: initialData.description || '',
    price: initialData.price || 0,
    is_active: initialData.is_active ?? true,
    is_paid: initialData.is_paid ?? false,
    recurrence_interval: (initialData.recurrence_interval as 'weekly' | 'monthly') || 'weekly',
    day_of_week: initialData.day_of_week || null,
    day_of_month: initialData.day_of_month || null,
    sector: initialData.sector || '',
    start_date: initialData.start_date
      ? formatDate(initialData.start_date)
      : formatDate(new Date()),
    end_date: initialData.end_date ? formatDate(initialData.end_date) : '',
  }));

  // Helper function to format dates as YYYY-MM-DD strings
  function formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Otherwise, try to parse and format
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date:', date, e);
      return '';
    }
  }

  // Fetch clients on component mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsData = await getClients();
        console.log("clientsData", clientsData);
        setClients(clientsData);

        // if (clientsData.length > 0) setSelectedClientId(clientsData[0].id);


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
    const clientId = e.target.value ? Number(e.target.value) : '';
    setFormData(prev => ({
      ...prev,
      client_id: clientId
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? Number(value)
          : value,
    }));
  };

  const handleDateChange = (field: 'start_date' | 'end_date' | 'valid_until') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value || undefined
      }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id) {
      alert('Por favor seleccione un cliente');
      return;
    }

    const dataToSubmit: NewSpecialServiceData = {
      ...formData,
      client_id: Number(formData.client_id),
      // Ensure all required fields are present
      name: formData.name,
      deceased_name: formData.deceased_name,
      description: formData.description,
      price: Number(formData.price),
      is_active: formData.is_active,
      is_paid: formData.is_paid,
      sector: formData.sector,
      start_date: formData.start_date,
      end_date: formData.end_date || undefined,
      recurrence_interval: formData.recurrence_interval || 'weekly',
      day_of_week: formData.day_of_week || null,
      day_of_month: formData.day_of_month || null,
    };

    console.log('Submitting form data:', dataToSubmit);
    onSubmit(dataToSubmit);
  };

  return (
    <form id="special-service-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
            Cliente *
          </label>
          {isLoadingClients ? (
            <Loader />
          ) : (
            <select
              id="client_id"
              name="client_id"
              value={formData.client_id || ''}
              onChange={handleClientChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              required
            >
              <option value="">Selecciona un cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
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
            name="deceased_name"
            value={formData.deceased_name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            required
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
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
            placeholder="Ej: Campo sto, Bloq B, Fila 3, Col 7, Nicho N.º 342"
            required
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Precio *
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
          placeholder="Ej: Ramo de flores sencillas"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
            Fecha de inicio *
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={typeof formData.start_date === 'string' ? formData.start_date : formatDate(formData.start_date)}
            onChange={handleDateChange('start_date')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            required
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
            Fecha de finalización (opcional)
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date ? (typeof formData.end_date === 'string' ? formData.end_date : formatDate(formData.end_date)) : ''}
            onChange={handleDateChange('end_date')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            min={formData.start_date ? (typeof formData.start_date === 'string' ? formData.start_date : formatDate(formData.start_date)) : ''}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="recurrence_interval" className="block text-sm font-medium text-gray-700">
            Frecuencia de servicio *
          </label>
          <select
            id="recurrence_interval"
            name="recurrence_interval"
            value={formData.recurrence_interval || 'weekly'}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          >
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>
        </div>

        {formData.recurrence_interval === 'weekly' ? (
          <div>
            <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700">
              Día de la semana *
            </label>
            <select
              id="day_of_week"
              name="day_of_week"
              value={formData.day_of_week || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, day_of_week: e.target.value as any }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              required
            >
              <option value="">Seleccione un día</option>
              <option value="monday">Lunes</option>
              <option value="tuesday">Martes</option>
              <option value="wednesday">Miércoles</option>
              <option value="thursday">Jueves</option>
              <option value="friday">Viernes</option>
              <option value="saturday">Sábado</option>
              <option value="sunday">Domingo</option>
            </select>
          </div>
        ) : (
          <div>
            <label htmlFor="day_of_month" className="block text-sm font-medium text-gray-700">
              Día del mes *
            </label>
            <select
              id="day_of_month"
              name="day_of_month"
              value={formData.day_of_month || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                day_of_month: e.target.value ? parseInt(e.target.value) : null
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              required
            >
              <option value="">Seleccione un día</option>
              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>
                  {day} {day === 1 ? 'de cada mes' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center hidden">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="hidden ml-2 block text-sm text-gray-700">
            Servicio Activo
          </label>
        </div>

        <div className="flex items-center hidden">
          <input
            type="checkbox"
            id="is_paid"
            name="is_paid"
            checked={formData.is_paid}
            onChange={(e) => setFormData(prev => ({ ...prev, is_paid: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_paid" className="ml-2 block text-sm text-gray-700">
            Pago Realizado
          </label>
        </div>

      </div>
    </form>
  );
}
