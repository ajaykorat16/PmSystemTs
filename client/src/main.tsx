import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import './index.css'
import { AuthProvider } from './contexts/AuthContext.tsx';
import { StoreProvider } from './store/store.tsx';
import { DepartmentProvider } from './contexts/DepartmentContext.tsx';
import { UserProvider } from './contexts/UserContext.tsx';
import { LeaveProvider } from './contexts/LeaveContext.tsx';
import { HelperProvider } from './contexts/Helper.tsx';
import { ProjectProvider } from './contexts/ProjectContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <React.StrictMode>
      <AuthProvider>
        <DepartmentProvider>
          <HelperProvider>
            <UserProvider>
              <ProjectProvider>
                <LeaveProvider>
                  <StoreProvider>
                    <App />
                  </StoreProvider>
                </LeaveProvider>
              </ProjectProvider>
            </UserProvider>
          </HelperProvider>
        </DepartmentProvider>
      </AuthProvider>
    </React.StrictMode>
  </BrowserRouter>
)
