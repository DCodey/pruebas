import React, { useState, useEffect } from 'react';
import type { Client } from '../../services/clientService';
import Input from '../ui/Input';

interface ClientFormProps {
  client: Client | null;
  onSubmit: (formData: { 
    nombre: string; 
    descripcion: string; 
    celular: number; 
    numeroDocumento?: string;
  }) => void;
  onClose: () => void;
}

export default function ClientForm({ client, onSubmit, onClose }: ClientFormProps) {
  const [formData, setFormData] = useState({ 
    nombre: '', 
    descripcion: '', 
    celular: 0, 
    numeroDocumento: '' 
  });

  useEffect(() => {
    if (client) {
      setFormData({ nombre: client.nombre, descripcion: client.descripcion, celular: Number(client.celular), numeroDocumento: client.numeroDocumento || '' });
    } else {
      setFormData({ nombre: '', descripcion: '', celular: 0, numeroDocumento: '' });
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
    <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6 pt-4">
          <Input
            id="nombre"
            name="nombre"
            label="Nombre del Cliente *"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <Input
            id="celular"
            name="celular"
            label="Celular"
            value={formData.celular}
            onChange={handleChange}
          />
          <Input
            id="numeroDocumento"
            name="numeroDocumento"
            label="Número de Documento"
            placeholder="DNI o RUC"
            value={formData.numeroDocumento}
            onChange={handleChange}
          />
          <Input
            as="textarea"
            id="descripcion"
            name="descripcion"
            label="Descripción"
            value={formData.descripcion}
            onChange={handleChange}
            rows={4}
          />
        </div>
    </form>
  );
}
