import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { type User } from '../../services/userService';
import { getRoles } from '../../services/rolesService';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Button } from '../ui/Button';

export interface UserFormData extends Omit<User, 'id' > {  
    password: string;
    role: string;
}

export interface UserFormProps {
  user: User | null;
  onSubmit: (formData: UserFormData) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
}

export default function UserForm({ user, onSubmit, onClose, isSubmitting = false }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  const [roles, setRoles] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error('Error cargando roles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRoles();

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: user.password || '',
        role: user.role || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: ''
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    }

    if (!user || formData.password) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      }
    }

    if (!formData.role?.trim()) {
      newErrors.role = 'El rol es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const userData: UserFormData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      role: formData.role.trim()
    };

    await onSubmit(userData);
  };

  return (
    <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-6">
          <Input
            id="name"
            label="Nombre"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            autoComplete="name"
          />
        </div>

        <div className="sm:col-span-6">
          <Input
            id="email"
            label="Usuario"
            name="email"
            type="text"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            autoComplete="email"
          />
        </div>

        <div className="sm:col-span-6">
          <Input
            id="password"
            label="Contraseña"
            name="password"
            type="password"
            value={formData.password || ''}
            onChange={handleChange}
            error={errors.password}
            required={!user}
            autoComplete="new-password"
          />
        </div>
        <div className="sm:col-span-6">
          <Select
            id="role"
            name="role"
            label="Rol"
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            required
            disabled={loading}
            options={[
              { value: '', label: 'Seleccionar rol' },
              ...roles.map(role => ({
                value: role.name,
                label: role.name
              }))
            ]}
            error={errors.role}
          />
        </div>
      </div>
    </form>
  );
}