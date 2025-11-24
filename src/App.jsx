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
import Salaries from './pages/salaries/Salaries';
import Costs from './pages/costs/Costs';
import Periods from './pages/periods/Periods';
import Contractor from './pages/contractor/Contractor';
import JiraIssue from './pages/jiraIssue/JiraIssue';
import CostItemDict from './pages/costItemDict/CostItemDict';
import JiraIssueCosts from './pages/jiraIssueCosts/JiraIssueCosts';

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
                
        <Route path="clockify" element={<Clockify />} />
        <Route path="salaries" element={<Salaries />} />
        <Route path="jiraissuecosts" element={<JiraIssueCosts />} />
        
        <Route path="deptcosts" element={<Costs />} />

        <Route path="costitemdict/:id/:tab" element={<CostItemDict />} />
        <Route path="costitemdict/:id" element={<CostItemDict />} />
        <Route path="costitemdict" element={<CostItemDict />} />

        <Route path="periods/:id/:tab" element={<Periods />} />
        <Route path="periods/:id" element={<Periods />} />
        <Route path="periods" element={<Periods />} />

        <Route path="users/:id/:tab" element={<Users />} />
        <Route path="users/:id" element={<Users />} />
        <Route path="users" element={<Users />} />

        <Route path="structures/:id/:tab" element={<Structures />} />
        <Route path="structures/:id" element={<Structures />} />
        <Route path="structures" element={<Structures />} />
        
        <Route path="employees/:id/:tab" element={<Employees />} />
        <Route path="employees/:id" element={<Employees />} />
        <Route path="employees" element={<Employees />} />

        <Route path="jiraissue/:id/:tab" element={<JiraIssue />} />
        <Route path="jiraissue/:id" element={<JiraIssue />} />
        <Route path="jiraissue" element={<JiraIssue />} />        

        <Route path="contractor/:id/:tab" element={<Contractor />} />
        <Route path="contractor/:id" element={<Contractor />} />
        <Route path="contractor" element={<Contractor />} />

        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
);

export default App;
