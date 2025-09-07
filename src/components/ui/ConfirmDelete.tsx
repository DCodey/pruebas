import React from 'react';
import Modal from './Modal';

interface ConfirmDeleteProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

const ConfirmDelete: React.FC<ConfirmDeleteProps> = ({
  isOpen,
  title = '¿Eliminar?',
  message = '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  onConfirm,
  onClose,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="py-2 text-center">
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-center gap-4 mt-4">
          <button
            type="button"
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-error-600 text-white hover:bg-error-700 border border-error-600 shadow-sm"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDelete;
