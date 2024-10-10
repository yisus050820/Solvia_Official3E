import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Typography } from '@mui/material';

const CrudUsuariosCoordi = () => {
  const [data, setData] = useState([]);
  const [filtroRol, setFiltroRol] = useState('');

  // Obtener usuarios al cargar la página
  useEffect(() => {
    axios.get('http://localhost:5000/usuarios')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const filteredData = filtroRol ? data.filter((user) => user.role === filtroRol) : data;

  return (
    <>
      <div className="w-full px-6 py-0.1 mx-auto mt-2">
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Usuarios
      </Typography>
        <div className="flex justify-between mb-4 space-x-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <label htmlFor="filtroRol" className="text-white mr-2">
              Filtrar por Rol:
            </label>
            <motion.select
              id="filtroRol"
              className="p-2 rounded bg-gray-800 text-white border border-gray-700"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <option value="">Todos</option>
              <option value="admin">Administrador</option>
              <option value="coordinator">Coordinador</option>
              <option value="volunteer">Voluntario</option>
              <option value="donor">Donante</option>
              <option value="beneficiary">Beneficiario</option>
            </motion.select>
          </motion.div>
        </div>

        {/* Tabla de usuarios */}
        <motion.table className="w-full bg-gray-800 text-white rounded-lg shadow-md">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Correo</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Descripción</th>
              <th className="p-4">Fecha Creación</th> {/* Nueva columna para la fecha de creación */}
            </tr>
          </thead>
          <motion.tbody layout>
            {filteredData.map((item) => (
              <motion.tr key={item.id} className="border-b border-gray-700">
                <td className="p-4">{item.id}</td>
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.email}</td>
                <td className="p-4">{item.role}</td>
                <td className="p-4">{item.description}</td>
                <td className="p-4">{item.created_at}</td> {/* Mostramos la fecha de creación */}
              </motion.tr>
            ))}
          </motion.tbody>
        </motion.table>
      </div>
    </>
  );
};

export default CrudUsuariosCoordi;
