import React, { Fragment } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full" onClick={(e) => e.stopPropagation()}>
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
              <h3 className="text-lg leading-6 font-medium text-gray-700 text-center pr-6" id="modal-title">
                {title}
              </h3>
              <div className="mt-4 max-h-[60vh] overflow-y-auto px-4">
                {children}
              </div>
            </div>
            {footer && (
              <div className="bg-gray-50 px-4 py-3 sm:px-6 border-t border-gray-200">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
