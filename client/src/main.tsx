import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import { AuthProvider } from './contexts/AuthContext.tsx';
import { StoreProvider } from './store/store.tsx';
import { DepartmentProvider } from './contexts/DepartmentContext.tsx';
import { UserProvider } from './contexts/UserContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <React.StrictMode>
      <AuthProvider>
        <DepartmentProvider>
          <UserProvider>
            <StoreProvider>
              <App />
            </StoreProvider>
          </UserProvider>
        </DepartmentProvider>
      </AuthProvider>
    </React.StrictMode>
  </BrowserRouter>
)
