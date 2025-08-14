import React from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

// Usamos una unión discriminada para manejar las props de input y textarea de forma segura
type BaseProps = {
  id: string;
  name: string;
  label?: string;
  error?: string;
  containerClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
};

type InputFieldProps = BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, keyof BaseProps> & {
  as?: 'input';
};

type TextareaFieldProps = BaseProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, keyof BaseProps> & {
  as: 'textarea';
};

type InputProps = InputFieldProps | TextareaFieldProps;

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(({ 
  id, 
  name, 
  label, 
  error,
  className = '',
  containerClassName = '',
  leftIcon,
  rightIcon,
  as: Component = 'input',
  ...props 
}, ref) => {
  const isTextarea = Component === 'textarea';
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon;

  const inputClasses = `block w-full bg-white rounded-lg border py-2.5 ${
    hasLeftIcon ? 'pl-10' : 'pl-3'
  } pr-${hasRightIcon ? '10' : '3'} text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ${
    error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-100'
  } ${isTextarea ? 'min-h-[100px]' : ''} ${className}`;

  const renderInput = () => {
    const commonProps = {
      id,
      name,
      className: inputClasses,
      'aria-invalid': !!error,
      'aria-describedby': error ? `${id}-error` : undefined,
      ref: ref as any,
      ...props
    };

    if (isTextarea) {
      return <textarea {...commonProps as TextareaHTMLAttributes<HTMLTextAreaElement>} />;
    }
    
    return <input {...commonProps as InputHTMLAttributes<HTMLInputElement>} />;
  };

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        {renderInput()}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center" id={`${id}-error`}>
          <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
