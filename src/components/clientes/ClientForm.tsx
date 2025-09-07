import React, { useState, useEffect } from 'react';
import type { Client } from '../../services/clientService';
import Input from '../ui/Input';

interface ClientFormProps {
  client: Client | null;
  onSubmit: (formData: Omit<Client, 'id'>) => void;
  onClose: () => void;
}

export default function ClientForm({ client, onSubmit, onClose }: ClientFormProps) {
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    name: '',
    description: '',
    phone: '',
    document_number: ''
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        description: client.description,
        phone: client.phone,
        document_number: client.document_number || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        phone: '',
        document_number: ''
      });
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clientData: Omit<Client, 'id'> = {
      name: formData?.name?.trim(),
      description: formData?.description?.trim(),
      phone: formData?.phone,
      ...(formData?.document_number && { document_number: formData?.document_number?.trim() })
    };
    onSubmit(clientData);
  };

  return (
    <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6 pt-4">
          <Input
            id="name"
            name="name"
            label="Nombre del Cliente *"
            value={formData?.name}
            onChange={handleChange}
            required
          />
          <Input
            id="phone"
            name="phone"
            label="Celular"
            value={formData?.phone || ''}
            onChange={handleChange}
          />
          <Input
            id="document_number"
            name="document_number"
            label="Número de Documento"
            placeholder="DNI o RUC"
            value={formData?.document_number}
            onChange={handleChange}
          />
          <Input
            as="textarea"
            id="description"
            name="description"
            label="Descripción"
            value={formData?.description}
            onChange={handleChange}
            rows={4}
          />
        </div>
    </form>
  );
}
