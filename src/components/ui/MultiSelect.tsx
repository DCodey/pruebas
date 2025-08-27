import React from 'react';
import Select, { type Props as SelectProps, type GroupBase, type StylesConfig } from 'react-select';

// Define the shape of the options
export interface MultiSelectOption {
  value: string;
  label: string;
}

// Define the props for our custom MultiSelect component
interface MultiSelectProps extends SelectProps<MultiSelectOption, true, GroupBase<MultiSelectOption>> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

// Custom styles for react-select to match Tailwind's design
const customStyles: StylesConfig<MultiSelectOption, true> = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '42px',
    backgroundColor: 'white',
    borderRadius: '0.5rem', // rounded-lg
    border: state.isFocused ? '2px solid #4f46e5' : '1px solid #d1d5db', // focus:border-primary-500, border-gray-300
    boxShadow: state.isFocused ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : 'none', // focus:ring-primary-100
    '&:hover': {
      borderColor: state.isFocused ? '#4f46e5' : '#9ca3af',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#e0e7ff', // bg-indigo-100
    borderRadius: '0.375rem',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#3730a3', // text-indigo-800
    fontWeight: 500,
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#4338ca', // text-indigo-700
    '&:hover': {
      backgroundColor: '#c7d2fe', // hover:bg-indigo-200
      color: '#312e81',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#f3f4f6' : 'white',
    color: state.isSelected ? 'white' : '#111827',
    '&:hover': {
      backgroundColor: state.isSelected ? '#4338ca' : '#e5e7eb',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6b7280', // placeholder-gray-500
  }),
};

const MultiSelect = React.forwardRef<any, MultiSelectProps>(({
  label,
  error,
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <Select
        ref={ref}
        isMulti
        styles={customStyles}
        placeholder="Seleccionar..."
        noOptionsMessage={() => 'No hay opciones'}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center">
          {error}
        </p>
      )}
    </div>
  );
});

MultiSelect.displayName = 'MultiSelect';

export default MultiSelect;
