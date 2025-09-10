import React, { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

// Utility function to merge class names
function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Label text or element to display next to the checkbox
   */
  label?: React.ReactNode;
  /**
   * Custom class name for the label element
   */
  labelClassName?: string;
  /**
   * Custom class name for the container div
   */
  containerClassName?: string;
  /**
   * Size of the checkbox
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Color scheme of the checkbox
   * @default 'primary'
   */
  color?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  /**
   * Show a required indicator (*) next to the label
   * @default false
   */
  requiredIndicator?: boolean;
  /**
   * Description text to show below the label
   */
  description?: string;
}

const sizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const colorClasses = {
  primary: 'text-primary-600 focus:ring-primary-500 border-gray-300 [&:checked]:bg-primary-600 [&:hover]:bg-primary-50 [&:checked:hover]:bg-primary-700 [&:focus]:ring-2 [&:focus]:ring-offset-2',
  success: 'text-green-600 focus:ring-green-500 border-green-300 [&:checked]:bg-green-600 [&:hover]:bg-green-50 [&:checked:hover]:bg-green-700',
  danger: 'text-red-600 focus:ring-red-500 border-red-300 [&:checked]:bg-red-600 [&:hover]:bg-red-50 [&:checked:hover]:bg-red-700',
  warning: 'text-yellow-600 focus:ring-yellow-500 border-yellow-300 [&:checked]:bg-yellow-600 [&:hover]:bg-yellow-50 [&:checked:hover]:bg-yellow-700',
  info: 'text-blue-600 focus:ring-blue-500 border-blue-300 [&:checked]:bg-blue-600 [&:hover]:bg-blue-50 [&:checked:hover]:bg-blue-700',
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>((
  {
    className,
    label,
    labelClassName,
    containerClassName,
    id,
    size = 'md',
    color = 'primary',
    requiredIndicator = false,
    description,
    disabled,
    ...props
  },
  ref
) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const labelSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];
  
  return (
    <div className={cn('relative flex items-start', containerClassName)}>
      <div className="flex h-5 items-center">
        <input
          id={checkboxId}
          type="checkbox"
          className={cn(
            'appearance-none rounded transition duration-150 ease-in-out',
            'disabled:cursor-not-allowed disabled:opacity-60',
            'border',
            'focus:outline-none',
            'cursor-pointer',
            'flex items-center justify-center',
            'bg-white',
            "after:content-[''] after:block after:w-1.5 after:h-2.5 after:border-white after:border-r-2 after:border-b-2 after:rotate-45 after:opacity-0 after:transition-opacity after:duration-150",
            'checked:after:opacity-100',
            sizeClasses[size],
            colorClasses[color],
            className
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        />
      </div>
      
      {(label || description) && (
        <div className="ml-3 text-sm">
          <label
            htmlFor={checkboxId}
            className={cn(
              'font-medium flex items-center text-gray-700 transition-colors duration-200',
              disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer',
              labelSize,
              labelClassName
            )}
          >
            {label}
            {requiredIndicator && (
              <span className="ml-1 text-red-500" aria-hidden="true">*</span>
            )}
          </label>
          {description && (
            <p 
              className={cn(
                'text-gray-500 mt-0.5',
                disabled ? 'opacity-60' : '',
                size === 'sm' ? 'text-xs' : 'text-sm'
              )}
              id={`${checkboxId}-description`}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };

export default Checkbox;
