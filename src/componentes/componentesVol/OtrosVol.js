import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Typography } from '@mui/material';

const UsuariosTarjeta = () => {
  const [data, setData] = useState([]);
  const [filtroRol, setFiltroRol] = useState('');
  const [mostrarCards, setMostrarCards] = useState(false);
  const [programasInscritos, setProgramasInscritos] = useState({}); // Almacenamos los programas inscritos por usuario.

  // Obtener usuarios y sus programas inscritos al cargar la página
  useEffect(() => {
    // Obtener información de usuarios
    const fetchUsuarios = axios.get('http://localhost:5000/usuarios');
    
    // Obtener información de los programas a los que están inscritos los beneficiarios
    const fetchProgramasInscritos = axios.get('http://localhost:5000/asigBenProg/asignaciones');

    Promise.all([fetchUsuarios, fetchProgramasInscritos])
      .then(([usuariosResponse, programasResponse]) => {
        setData(usuariosResponse.data);
        
        // Estructurar los programas inscritos por cada beneficiario
        const programasMap = {};
        programasResponse.data.forEach((asignacion) => {
          const { user_id, program_name } = asignacion;
          if (!programasMap[user_id]) {
            programasMap[user_id] = [];
          }
          programasMap[user_id].push(program_name);
        });
        setProgramasInscritos(programasMap);
      })
      .catch((error) => {
        console.error('Error fetching users or enrolled programs:', error);
      });
  }, []);

  // Filtrar datos según el rol seleccionado
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

        {/* Mostrar contenido dependiendo del estado del switch */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((item) => (
              <motion.div
                key={item.id}
                className="bg-gray-800 text-white p-6 rounded-lg shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-center items-center">
                <img
                    src={`http://localhost:5000${item.profile_picture}`}
                    alt={item.name}
                    className="h-32 w-32 object-cover rounded-full mb-4"
                  />
                </div>
                <Typography variant="h5" gutterBottom className="flex justify-center">
                  {item.name}
                </Typography>
                <Typography variant="body1" gutterBottom className="flex justify-center">
                  {item.role}
                </Typography>
                <Typography variant="body2" gutterBottom className="flex justify-center">
                  {item.email}
                </Typography>
                <Typography variant="body2" className="flex justify-center">
                  {item.description}
                </Typography>
              </motion.div>
            ))}
          </div>
      </div>
    </>
  );
};

export default UsuariosTarjeta;
