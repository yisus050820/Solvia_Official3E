import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Registro from './componentes/Registro';
import Login from './componentes/Login';
import DashboardLayoutBasic from './componentes/dashboardAdmin';
import CrudUsuarios from './componentes/componentesAdmin/UsuariosCrud';
import PerfilUsuario from './componentes/componentesAdmin/ConfigDePerfil';
import AsignacionesBen_Pro from './componentes/componentesAdmin/AsignacionesBen_Pro';
import CrudProgramas from './componentes/componentesAdmin/ProgramasCrud';
import AsignacionesCoord_Pro from './componentes/componentesAdmin/AsignacionesCoord_Pro';
import AsignacionesVol_Pro from './componentes/componentesAdmin/AsignacionesVol_Pro';
import AsignacionPresupuesto_Pro from './componentes/componentesAdmin/AsignacionesPresupuesto_Pro';




function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait"> 
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<DashboardLayoutBasic />} />
        <Route path="/register" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardLayoutBasic />} />
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
