import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Registro from './componentes/Registro';
import Login from './componentes/Login';
import DashboardAdmin from './componentes/dashboardAdmin';
import DashboardDonante from './componentes/dashboardDonante';
import DashboardCoordi from './componentes/dashboardCoordi';
import DashboardBeneficiario from './componentes/dashboardBeneficiario';
import LandingPage from './componentes/index';
import ResetPassword from './componentes/ResetPassword';
import DashboardVoluntario from './componentes/dashboardVoluntario';




function App() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [userRole, setUserRole] = useState(null);

  // Manejar inicio de sesión
  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.token) {
        // Guardar el token y el rol
        localStorage.setItem('token', data.token);
        setUserRole(data.role);

        // Redirigir según el rol
        switch (data.role) {
          case 'admin':
            navigate('/Admin');
            break;
          case 'donor':
            navigate('/DonadorCrud');
            break;
          case 'volunteer':
            navigate('/VoluntarioCrud');
            break;
          case 'coordinator':
            navigate('/CoordiCrud');
            break;
          case 'beneficiary':
            navigate('/BeneficiarioCrud');
            break;   
          default:
            navigate('/');
        }
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Registro />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/Admin" element={<DashboardAdmin />} />
        <Route path="/CoordiCrud" element={<DashboardCoordi />} />
        <Route path="/DonadorCrud" element={<DashboardDonante />} />
        <Route path="/BeneficiarioCrud" element={<DashboardBeneficiario />} />
        <Route path="/VoluntarioCrud" element={<DashboardVoluntario />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* Ruta para el restablecimiento */}
        <Route path="/index" element={<LandingPage />} />
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