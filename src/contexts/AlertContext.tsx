import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertDialog, AlertOptions } from '../components/ui/AlertDialog';

interface AlertContextType {
  alert: (options: Omit<AlertOptions, 'type'>) => Promise<void>;
  confirm: (options: Omit<AlertOptions, 'type'>) => Promise<boolean>;
  success: (options: Omit<AlertOptions, 'type'>) => Promise<void>;
  warning: (options: Omit<AlertOptions, 'type'>) => Promise<void>;
  error: (options: Omit<AlertOptions, 'type'>) => Promise<void>;
  info: (options: Omit<AlertOptions, 'type'>) => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    options: AlertOptions | null;
    resolve?: (value?: any) => void;
  }>({
    isOpen: false,
    options: null,
  });

  const showAlert = useCallback((options: AlertOptions): Promise<any> => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const closeAlert = useCallback(() => {
    if (alertState.resolve) {
      alertState.resolve();
    }
    setAlertState({
      isOpen: false,
      options: null,
    });
  }, [alertState.resolve]);

  const handleConfirm = useCallback(() => {
    alertState.options?.onConfirm?.();
    if (alertState.resolve) {
      alertState.resolve(true);
    }
    closeAlert();
  }, [alertState.options, alertState.resolve, closeAlert]);

  const handleCancel = useCallback(() => {
    alertState.options?.onCancel?.();
    if (alertState.resolve) {
      alertState.resolve(false);
    }
    closeAlert();
  }, [alertState.options, alertState.resolve, closeAlert]);

  const alert = useCallback(
    (options: Omit<AlertOptions, 'type'>) => {
      return showAlert({ ...options, type: 'info' });
    },
    [showAlert]
  );

  const confirm = useCallback(
    (options: Omit<AlertOptions, 'type'>): Promise<boolean> => {
      return showAlert({ ...options, type: 'confirm' }) as Promise<boolean>;
    },
    [showAlert]
  );

  const success = useCallback(
    (options: Omit<AlertOptions, 'type'>) => {
      return showAlert({ ...options, type: 'success' });
    },
    [showAlert]
  );

  const warning = useCallback(
    (options: Omit<AlertOptions, 'type'>) => {
      return showAlert({ ...options, type: 'warning' });
    },
    [showAlert]
  );

  const error = useCallback(
    (options: Omit<AlertOptions, 'type'>) => {
      return showAlert({ ...options, type: 'error' });
    },
    [showAlert]
  );

  const info = useCallback(
    (options: Omit<AlertOptions, 'type'>) => {
      return showAlert({ ...options, type: 'info' });
    },
    [showAlert]
  );

  const alertOptions = alertState.options
    ? {
        ...alertState.options,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
      }
    : null;

  return (
    <AlertContext.Provider value={{ alert, confirm, success, warning, error, info }}>
      {children}
      <AlertDialog
        isOpen={alertState.isOpen}
        options={alertOptions}
        onClose={closeAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
