import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { AppRoutes } from './routes';
import { store } from './store';
import { Toaster } from './components/ui/ToasterComponent';
import { useToast } from './components/ui/useToast';
import './index.css';

function App(): React.ReactElement {
  const { toasts, removeToast } = useToast();

  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <AppRoutes />
          <Toaster toasts={toasts} onRemove={removeToast} />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
