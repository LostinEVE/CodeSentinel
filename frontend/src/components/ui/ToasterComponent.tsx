import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { Toast } from './toaster';

const toastIcon = ({ type }: { type: Toast['type'] }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-500" />;
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const toastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const getToastStyles = () => {
    const baseStyles = "flex items-start p-4 rounded-lg shadow-lg border transition-all duration-300 transform";
    const visibilityStyles = isVisible 
      ? "translate-y-0 opacity-100" 
      : "translate-y-2 opacity-0";
    
    const typeStyles = {
      success: "bg-green-50 border-green-200",
      error: "bg-red-50 border-red-200",
      warning: "bg-yellow-50 border-yellow-200",
      info: "bg-blue-50 border-blue-200"
    };

    return `${baseStyles} ${visibilityStyles} ${typeStyles[toast.type]}`;
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex-shrink-0">
        {toastIcon({ type: toast.type })}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-900">{toast.message}</p>
      </div>
      <div className="ml-4 flex-shrink-0">
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onRemove(toast.id), 300);
          }}
          className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const Toaster = ({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <div key={toast.id}>
          {toastItem({ toast, onRemove })}
        </div>
      ))}
    </div>
  );
};

export default Toaster;
