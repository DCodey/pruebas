import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  errors?: Record<string, string[]> | string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const alertStyles = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
};

export default function Alert({
  type = 'info',
  message,
  errors,
  onClose,
  autoClose = true,
  duration = 5000,
}: AlertProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-4 mb-4 border rounded-lg shadow-lg ${alertStyles[type]}`}
      role="alert"
    >
      <div className="ml-3">
        <div className="text-sm font-medium">{message}</div>
        {errors && (
          <div className="mt-2 text-sm text-red-700">
            {typeof errors === 'string' ? (
              <p>{errors}</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries(errors).flatMap(([field, messages]) => {
                  // Si es un array de mensajes, mostramos cada uno
                  if (Array.isArray(messages)) {
                    return messages.map((msg, index) => (
                      <li key={`${field}-${index}`}>
                        {msg}
                      </li>
                    ));
                  }
                  // Si es un solo mensaje, lo mostramos directamente
                  return (
                    <li key={field}>
                      {messages}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-opacity-20 hover:bg-current"
        onClick={onClose}
        aria-label="Cerrar"
      >
        <span className="sr-only">Cerrar</span>
        <XMarkIcon className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
}
