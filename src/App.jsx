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
import Employees from './pages/employees/Employees';
import Structures from './pages/structures/Structures';

import Clockify from './pages/clockify/Clockify';
import ClockifyData from './pages/clockify/ClockifyData';
import UploadSalaries from './pages/salaries/uploadSalaries/UploadSalaries';
import Salaries from './pages/salaries/salaries/Salaries';
import Costs from './pages/costs/Costs';

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
        <Route path="structures" element={<Structures />} />
        <Route path="employees" element={<Employees />} />
        <Route path="clockify" element={<Clockify />} />
        <Route path="clockifyData" element={<ClockifyData />} />
        <Route path="uploadsalaries" element={<UploadSalaries />} />
        <Route path="salaries" element={<Salaries />} />
        <Route path="deptcosts" element={<Costs />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
);

export default App;
