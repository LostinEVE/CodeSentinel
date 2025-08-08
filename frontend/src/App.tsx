import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AppRoutes } from './routes';
import { store } from './store';
import { Toaster } from './components/ui/ToasterComponent';
import { ToastContext, ToastContextType } from './components/ui/ToastContext';
import { Toast } from './components/ui/toaster';
import './index.css';

function App(): React.ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toastContextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast
  };

  return (
    <Provider store={store}>
      <ToastContext.Provider value={toastContextValue}>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <React.Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            }>
              <AppRoutes />
            </React.Suspense>
            <Toaster toasts={toasts} onRemove={removeToast} />
          </div>
        </BrowserRouter>
      </ToastContext.Provider>
    </Provider>
  );
}

export default App;
