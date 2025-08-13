import React from 'react';

// Usamos una unión discriminada para manejar las props de input y textarea de forma segura
type BaseProps = {
  id: string;
  name: string;
  label: string;
  error?: string;
  className?: string;
};

type InputFieldProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement> & {
  as?: 'input';
};

type TextareaFieldProps = BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  as: 'textarea';
};

type InputProps = InputFieldProps | TextareaFieldProps;

const Input: React.FC<InputProps> = ({ id, name, label, ...props }) => {
  const commonClasses = `block w-full border rounded-md py-2 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
    props.error
      ? 'border-red-300 text-red-900 focus:ring-red-500 ring-red-300'
      : 'border-gray-300 focus:ring-primary-50 ring-gray-300'
  }`;

  return (
    <div className={props.className}>
      <div className="flex justify-between">
        <label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-700">
          {label}
        </label>
        {props.error && (
          <p className="text-sm text-red-600" id={`${id}-error`}>
            {props.error}
          </p>
        )}
      </div>
      <div className="mt-1">
        {props.as === 'textarea' ? (
          <textarea
            id={id}
            name={name}
            className={commonClasses}
            aria-invalid={!!props.error}
            aria-describedby={props.error ? `${id}-error` : undefined}
            {...(props as Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>)}
          />
        ) : (
          <input
            id={id}
            name={name}
            className={commonClasses}
            aria-invalid={!!props.error}
            aria-describedby={props.error ? `${id}-error` : undefined}
            {...(props as Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'>)}
          />
        )}
      </div>
    </div>
  );
};

export default Input;
