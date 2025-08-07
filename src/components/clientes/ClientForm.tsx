import React, { useState, useEffect } from 'react';
import type { Client } from '../../services/clientService';
import Input from '../ui/Input';

interface ClientFormProps {
  client: Client | null;
  onSubmit: (formData: { nombre: string; descripcion: string; }) => void;
  onClose: () => void;
}

export default function ClientForm({ client, onSubmit, onClose }: ClientFormProps) {
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

  useEffect(() => {
    if (client) {
      setFormData({ nombre: client.nombre, descripcion: client.descripcion });
    } else {
      setFormData({ nombre: '', descripcion: '' });
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6 pt-4">
          <Input
            id="nombre"
            name="nombre"
            label="Nombre del Cliente"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <Input
            as="textarea"
            id="descripcion"
            name="descripcion"
            label="Descripción"
            value={formData.descripcion}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>
      <div className="mt-8 flex justify-end gap-x-4">
        <button type="button" onClick={onClose} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancelar</button>
        <button type="submit" className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">Guardar</button>
      </div>
    </form>
  );
}
