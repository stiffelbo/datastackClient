import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
//Components
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';
//Pages
import Home from './pages/home/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Users from './pages/users/Users';

import Clockify from './pages/clockify/Clockify';
import ClockifyData from './pages/clockify/ClockifyData';

const App = () => (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="users" element={<Users />} />
        <Route path="clockify" element={<Clockify />} />
        <Route path="clockifyData" element={<ClockifyData />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
);

export default App;
