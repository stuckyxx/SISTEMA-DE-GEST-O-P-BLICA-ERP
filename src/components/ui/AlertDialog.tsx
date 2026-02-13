import React, { useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertDialogProps {
  isOpen: boolean;
  options: AlertOptions | null;
  onClose: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  options,
  onClose,
}) => {
  const handleConfirm = useCallback(() => {
    options?.onConfirm?.();
    onClose();
  }, [options, onClose]);

  const handleCancel = useCallback(() => {
    options?.onCancel?.();
    onClose();
  }, [options, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (options?.type === 'confirm') {
          handleCancel();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, options, onClose, handleCancel]);

  if (!isOpen || !options) return null;

  const getIcon = () => {
    const iconClass = 'w-12 h-12';
    switch (options.type) {
      case 'success':
        return <CheckCircle2 className={`${iconClass} text-green-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-amber-500`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      case 'confirm':
        return <AlertCircle className={`${iconClass} text-blue-500`} />;
      default:
        return <Info className={`${iconClass} text-blue-500`} />;
    }
  };

  const getIconBg = () => {
    switch (options.type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900/30';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30';
      case 'confirm':
        return 'bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const getButtonStyles = () => {
    switch (options.type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-200 dark:shadow-green-900/30';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-xl shadow-amber-200 dark:shadow-amber-900/30';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-200 dark:shadow-red-900/30';
      case 'confirm':
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/30';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/30';
    }
  };

  const isConfirmType = options.type === 'confirm';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md overflow-hidden flex flex-col shadow-2xl scale-in-center border border-white/10 dark:border-slate-800">
        {/* Header com ícone */}
        <div className="px-8 py-8 flex flex-col items-center text-center relative">
          <div className={`w-20 h-20 ${getIconBg()} rounded-3xl flex items-center justify-center mb-4 shadow-inner`}>
            {getIcon()}
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mb-2">
            {options.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {options.message}
          </p>
        </div>

        {/* Botões */}
        <div className="px-8 pb-8">
          {isConfirmType ? (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700"
              >
                {options.cancelText || 'Cancelar'}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-6 py-4 rounded-2xl font-bold transition-all ${getButtonStyles()}`}
              >
                {options.confirmText || 'Confirmar'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleConfirm}
              className={`w-full px-6 py-4 rounded-2xl font-bold transition-all ${getButtonStyles()}`}
            >
              {options.confirmText || 'OK'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
