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
    minHeight: '39px',
    backgroundColor: 'white',
    borderRadius: '0.5rem', // rounded-lg
    border: state.isFocused ? '1px solid var(--tw-color-primary-600, #059669)' : '1px solid var(--tw-color-neutral-300, #d1d5db)',
    boxShadow: state.isFocused ? '0 0 0 2px var(--tw-color-primary-100, #d1fae5)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? 'var(--tw-color-primary-600, #059669)' : 'var(--tw-color-neutral-400, #94a3b8)',
    },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: 'var(--tw-color-primary-200, #a7f3d0)',
    borderRadius: '0.375rem',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'var(--tw-color-primary-800, #065f46)',
    fontWeight: 500,
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: 'var(--tw-color-primary-600, #059669)',
    '&:hover': {
      backgroundColor: 'var(--tw-color-primary-200, #a7f3d0)',
      color: 'var(--tw-color-primary-800, #065f46)',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? 'var(--tw-color-primary-600, #059669)'
      : state.isFocused
      ? 'var(--tw-color-primary-50, #ecfdf5)'
      : 'white',
    color: state.isSelected ? 'white' : '#111827',
    '&:hover': {
      backgroundColor: state.isSelected
        ? 'var(--tw-color-primary-700, #047857)'
        : 'var(--tw-color-primary-200, #a7f3d0)',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--tw-color-neutral-500, #64748b)',
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
