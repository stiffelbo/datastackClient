import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import App from './App';

import { AuthProvider } from './context/AuthContext';
import { NavProvider } from './context/NavContext';
import { CurrentProvider } from './context/CurrentContext';
import { TabsProvider } from './context/TabsContext';
import { FiltersProvider } from './context/FiltersContext';
import { PresetsProvider } from './context/PresetsContext';



const root = createRoot(document.getElementById('root'));

const basename = '/datastack';

root.render(
  <BrowserRouter basename={basename} >
    <AuthProvider>
      <NavProvider>
        <CurrentProvider>
          <TabsProvider>
            <FiltersProvider>
              <PresetsProvider >
                <App />
                <ToastContainer position="bottom-right" autoClose={3000} />
              </PresetsProvider>
            </FiltersProvider>
          </TabsProvider>
        </CurrentProvider>
      </NavProvider>
    </AuthProvider>
  </BrowserRouter>
);