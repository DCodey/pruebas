import React, { Fragment } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
  '6xl': 'sm:max-w-6xl',
  '7xl': 'sm:max-w-7xl'
};

export default function Modal({ isOpen, onClose, title, children, footer, size = 'lg' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* Centrado vertical y horizontal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className={`inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:w-full ${sizeClasses[size]}`} onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col h-full">
            <div className="relative bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex-grow">
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
                aria-label="Cerrar"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-lg leading-6 font-medium text-gray-700 text-center pr-6 border-b border-gray-200 pb-2" id="modal-title">
                {title}
              </h3>
              <div className="mt-4 max-h-[60vh] overflow-y-auto px-1 md:px-4">
                {children}
              </div>
            </div>
            {footer && (
              <div className="bg-gray-50 px-1 md:px-4 py-3 sm:px-6 border-t border-gray-200">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
