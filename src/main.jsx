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


const root = createRoot(document.getElementById('root'));

const basename = '/datastack';

root.render(
  <BrowserRouter basename={basename} >
    <AuthProvider>
      <NavProvider>
        <CurrentProvider>
          <TabsProvider>
            <App />
            <ToastContainer position="bottom-right" autoClose={3000} />
          </TabsProvider>
        </CurrentProvider>
      </NavProvider>
    </AuthProvider>
  </BrowserRouter>
);