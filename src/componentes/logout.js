import React from 'react';
import axios from 'axios';

function CerrarSesion() {
  const handleLogout = () => {
    localStorage.clear(); // Limpiar localStorage completamente
    delete axios.defaults.headers.common['Authorization']; // Limpiar encabezados globales
    window.location.href = '/index'; // Redirigir a la página de inicio o login
  };

  React.useEffect(() => {
    handleLogout();
  }, []);

  return (
    <div>
      <p class='text-black'>Redirigiendo...</p>
    </div>
  );
}

export default CerrarSesion;