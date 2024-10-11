import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaPlus } from 'react-icons/fa';
import { Typography } from '@mui/material';

const MensajesRecibidos = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulación de la petición al backend
    axios.get('http://localhost:5000/usuarios') // Cambia esto por tu API real
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleOpenModal = () => {
    // Aquí puedes agregar lógica si necesitas abrir un modal para crear algo
  };

  return (
    <>
      <div className="w-full px-6 py-0.1 mx-auto mt-2">
        <Typography variant="h3" align="center" color="primary" gutterBottom>
          Mensajes de los Usuarios
        </Typography>

        <div className="flex justify-between mb-4 space-x-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          ></motion.div>

        </div>

        {/* Tabla con las etiquetas alineadas a la izquierda */}
        <motion.table className="w-full bg-gray-800 text-white rounded-lg shadow-md">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 text-left" style={{ textAlign: 'left' }}>ID</th>
              <th className="p-4 text-left" style={{ textAlign: 'left' }}>Nombre</th>
              <th className="p-4 text-left" style={{ textAlign: 'left' }}>Correo</th>
              <th className="p-4 text-left" style={{ textAlign: 'left' }}>Rol</th>
              <th className="p-4 text-left" style={{ textAlign: 'left' }}>Mensajes</th>
            </tr>
          </thead>
          <motion.tbody layout>
            {data.length > 0 ? (
              data.map((item) => (
                <motion.tr key={item.id} className="border-b border-gray-700">
                  <td className="p-4" style={{ textAlign: 'left' }}>{item.id}</td>
                  <td className="p-4" style={{ textAlign: 'left' }}>{item.name}</td>
                  <td className="p-4" style={{ textAlign: 'left' }}>{item.email}</td>
                  <td className="p-4" style={{ textAlign: 'left' }}>{item.role}</td>
                  <td className="p-4" style={{ textAlign: 'left' }}></td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center">
                  No hay datos disponibles
                </td>
              </tr>
            )}
          </motion.tbody>
        </motion.table>
      </div>
    </>
  );
};

export default MensajesRecibidos;
