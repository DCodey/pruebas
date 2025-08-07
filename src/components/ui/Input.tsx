import React from 'react';

// Usamos una unión discriminada para manejar las props de input y textarea de forma segura
type BaseProps = {
  id: string;
  name: string;
  label: string;
};

type InputFieldProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement> & {
  as?: 'input';
};

type TextareaFieldProps = BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  as: 'textarea';
};

type InputProps = InputFieldProps | TextareaFieldProps;

const Input: React.FC<InputProps> = ({ id, name, label, ...props }) => {
  const commonClasses =
    'block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-50 sm:text-sm sm:leading-6';

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-700">
        {label}
      </label>
      <div className="mt-2">
        {props.as === 'textarea' ? (
          <textarea
            id={id}
            name={name}
            className={commonClasses}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={id}
            name={name}
            className={commonClasses}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
    </div>
  );
};

export default Input;
