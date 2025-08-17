import { createContext, useContext, useState, type ReactNode } from 'react';
import Alert from '../components/ui/Alert';
import type { AlertType } from '../components/ui/Alert';

type AlertOptions = {
  type: AlertType;
  message: string;
  duration?: number;
  errors?: Record<string, string[]> | string;
};

type AlertContextType = {
  showAlert: (options: AlertOptions) => void;
  showError: (message: string, duration?: number, errors?: Record<string, string[]> | string) => void;
  showSuccess: (message: string, duration?: number) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const showAlert = ({ type, message, duration = 5000, errors }: AlertOptions) => {
    setAlert({ type, message, duration, errors });
  };

  const showError = (message: string, duration = 5000, errors?: Record<string, string[]> | string) => {
    showAlert({ type: 'error', message, duration, errors });
  };

  const showSuccess = (message: string, duration = 3000) => {
    showAlert({ type: 'success', message, duration });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert, showError, showSuccess }}>
      {children}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={closeAlert}
          duration={alert.duration}
          errors={alert.errors}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
