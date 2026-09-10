import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import App from './App';

import { AuthProvider } from './context/AuthContext';
import { NavProvider } from './context/NavContext';
import { RwdProvider } from './context/RwdContext';
import { DashboardProvider } from './context/DashboardContext';
import { EntityProvider } from './context/EntityContext';

const root = createRoot(document.getElementById('root'));

const basename = '/datastack';

root.render(
  <BrowserRouter basename={basename} >
      <RwdProvider>
        <AuthProvider>
          <NavProvider>      
            <DashboardProvider>
              <EntityProvider>
                <App />
                <ToastContainer position="bottom-right" autoClose={3000} />
              </EntityProvider>
            </DashboardProvider>
          </NavProvider>
        </AuthProvider>
      </RwdProvider> 
  </BrowserRouter>
);