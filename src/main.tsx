import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { CompanyProvider } from './contexts/CompanyContext';
import { AuthProvider } from './contexts/AuthContext';
import '../app/app.css';

// Creamos el enrutador fuera del renderizado
const router = createBrowserRouter([
  {
    path: '/*',
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CompanyProvider>
        <RouterProvider router={router} />
      </CompanyProvider>
    </AuthProvider>
  </React.StrictMode>
);
