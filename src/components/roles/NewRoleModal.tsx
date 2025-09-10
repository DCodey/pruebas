import React, { useState } from 'react';
import { useAlert } from 'src/contexts/AlertContext';

// Tipos para las props del modal
interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roleName: string) => Promise<void>;
  isSubmitting: boolean;
  roleToEdit?: {
    id: string;
    name: string;
  } | null;
}

const NewRoleModal: React.FC<RoleModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  isSubmitting,
  roleToEdit
}) => {
  const [roleName, setRoleName] = useState(roleToEdit?.name || '');
  const { showError } = useAlert();

  // Actualizar el nombre del rol cuando cambie el rol a editar
  React.useEffect(() => {
    setRoleName(roleToEdit?.name || '');
  }, [roleToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      showError('El nombre del rol es requerido');
      return;
    }
    onSubmit(roleName.trim()).then(() => {
      if (!roleToEdit) {
        setRoleName(''); // Limpiar solo si es creación
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {roleToEdit ? 'Editar Rol' : 'Nuevo Rol'}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              disabled={isSubmitting}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Rol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="roleName"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ej: Administrador"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!roleName.trim() || isSubmitting}
                  className={`px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    (!roleName.trim() || isSubmitting) ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting 
                  ? roleToEdit 
                    ? 'Actualizando...' 
                    : 'Creando...' 
                  : roleToEdit 
                    ? 'Actualizar Rol' 
                    : 'Crear Rol'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewRoleModal;
