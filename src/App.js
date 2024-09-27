import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Registro from './componentes/Registro';
import Login from './componentes/Login';
<<<<<<< HEAD
import DashboardLayoutBasic from './componentes/dashboard';
=======
import DashboardLayoutBasic from './componentes/dashboardAdmin';




>>>>>>> 5dab1b3b9d67a8323bf26069badd304ea925ea9f

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait"> 
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<DashboardLayoutBasic />} />
        <Route path="/register" element={<Registro />} />
        <Route path="/login" element={<Login />} />
<<<<<<< HEAD
        <Route path="/dashboard" element={<DashboardLayoutBasic/>} />
=======
        <Route path="/dashboard" element={<DashboardLayoutBasic />} />
>>>>>>> 5dab1b3b9d67a8323bf26069badd304ea925ea9f
      </Routes>
    </AnimatePresence>
  );
}

export default function AnimatedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
