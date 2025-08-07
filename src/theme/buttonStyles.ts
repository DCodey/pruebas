type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
  secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500',
  danger: 'bg-error-600 hover:bg-error-700 text-white focus:ring-error-500',
  ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-800 focus:ring-neutral-200',
  outline: 'bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 focus:ring-primary-500',
};

export const buttonBaseClasses = 'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors border border-transparent';

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export const getButtonClasses = ({
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  className = '',
}: ButtonStyleProps = {}) => {
  return [
    buttonBaseClasses,
    variantClasses[variant],
    fullWidth ? 'w-full' : '',
    (isLoading || disabled) ? 'opacity-60 cursor-not-allowed' : '',
    className,
  ].filter(Boolean).join(' ').trim();
};
