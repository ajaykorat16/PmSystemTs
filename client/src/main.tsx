import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import { AuthProvider } from './contexts/AuthContext.tsx';
import { StoreProvider } from './store/store.tsx';
import { DepartmentProvider } from './contexts/DepartmentContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <React.StrictMode>
      <AuthProvider>
        <DepartmentProvider>
          <StoreProvider>
            <App />
          </StoreProvider>
        </DepartmentProvider>
      </AuthProvider>
    </React.StrictMode>,
  </BrowserRouter>
)
