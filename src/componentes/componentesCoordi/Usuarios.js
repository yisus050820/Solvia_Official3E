import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Typography, Switch, TextField, Avatar } from '@mui/material';

const CrudUsuariosCoordi = () => {
  const [user, setUser] = useState([]);
  const [filtroRol, setFiltroRol] = useState('');
  const [mostrarCards, setMostrarCards] = useState(false);
  const [programasInscritos, setProgramasInscritos] = useState({}); // Almacenamos los programas inscritos por usuario.
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Obtener usuarios y sus programas inscritos al cargar la página
  useEffect(() => {
    // Obtener información de usuarios
    const fetchUsuarios = axios.get('http://localhost:5000/usuarios');

    // Obtener información de los programas a los que están inscritos los beneficiarios
    const fetchProgramasInscritos = axios.get('http://localhost:5000/asigBenProg/asignaciones');

    Promise.all([fetchUsuarios, fetchProgramasInscritos])
      .then(([usuariosResponse, programasResponse]) => {
        setUser(usuariosResponse.data);

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

  const truncateDescription = (description) => {
    if (!description) return '';
    return description.length > 50 ? description.slice(0, 50) + '...' : description;
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const sortedUser = [...user].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "email") return a.email.localeCompare(b.email);
    if (sortBy === "birth_date") return new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime();
    if (sortBy === "role") return a.role.localeCompare(b.role);
    if (sortBy === "description") return a.description.localeCompare(b.description);
    if (sortBy === "created_at") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return 0;
  });

  const filteredUser = sortedUser.filter((user) => {
    const matchesSearchQuery = (
      user.name.toLowerCase().includes(searchQuery) ||
      user.email.toLowerCase().includes(searchQuery) ||
      (user.birth_date && user.birth_date.toLowerCase().includes(searchQuery)) ||
      user.role.toLowerCase().includes(searchQuery) ||
      (user.description && user.description.toLowerCase().includes(searchQuery)) ||
      (user.created_at && user.created_at.toLowerCase().includes(searchQuery))
    );
    
    const matchesRole = filtroRol === '' || user.role === filtroRol; // Condición de filtro de rol
    
    return matchesSearchQuery && matchesRole;
  });  

  return (
    <div className="w-full px-6 py-0.1 mx-auto mt-2">
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Usuarios
      </Typography>
      <div className="flex justify-between mb-4 space-x-4">
        {/* Filtro por Rol y Campo de Búsqueda juntos */}
        <div className="flex space-x-4">
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

          <TextField
            label="Buscar..."
            variant="outlined"
            sx={{
              mb: 2,
              backgroundColor: 'white',          // Fondo blanco
              color: 'black',                     // Color del texto
              borderRadius: '5px',                // Bordes redondeados
              '& .MuiOutlinedInput-root': {
                height: '36px',                   // Altura total del input
                fontSize: '0.9rem',               // Tamaño del texto
                '& input': {
                  color: 'black',                 // Color del texto en el campo de entrada
                  padding: '8px 14px',            // Ajusta el padding interno
                },
                '& fieldset': {
                  borderColor: '#ccc',            // Color del borde
                },
                '&:hover fieldset': {
                  borderColor: '#888',            // Color de borde al pasar el cursor
                },
              },
              '& .MuiInputLabel-root': {
                color: '#888',                    // Color del texto de la etiqueta
                fontSize: '0.9rem',
                top: '-6px',                      // Ajusta la posición de la etiqueta
              },
            }}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center">
          <Typography variant="body1" color="primary" className="mr-2">
            Ver en tarjetas
          </Typography>
          <Switch
            checked={mostrarCards}
            onChange={() => setMostrarCards(!mostrarCards)}
            color="primary"
          />
        </div>
      </div>

      {/* Mostrar contenido dependiendo del estado del switch */}
      {mostrarCards ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUser.map((item) => (
            <motion.div
              key={item.id}
              className="bg-gray-800 text-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Avatar
                src={`http://localhost:5000${item.profile_picture}?${new Date().getTime()}`}
                alt={item.name}
                sx={{
                  width: 128,
                  height: 128,
                  marginBottom: 2,
                  objectFit: 'cover',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              />
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
      ) : (
        <motion.table className="w-full bg-gray-800 text-white rounded-lg shadow-md">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Correo</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Descripción</th>
              <th className="p-4">Programas Inscritos</th>
              <th className="p-4">Fecha Creación</th>
            </tr>
          </thead>
          <motion.tbody layout>
            {filteredUser.map((item) => (
              <motion.tr key={item.id} className="border-b border-gray-700">
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.email}</td>
                <td className="p-4">{item.role}</td>
                <td className="p-4">{truncateDescription(item.description)}</td>
                <td className="p-4">
                  {programasInscritos[item.id] && programasInscritos[item.id].length > 0 ? (
                    <ul className="list-disc list-inside">
                      {programasInscritos[item.id].map((programa, index) => (
                        <li key={index}>{programa}</li>
                      ))}
                    </ul>
                  ) : (
                    'No inscrito en ningún programa'
                  )}
                </td>
                <td className="p-4">{item.created_at}</td>
              </motion.tr>
            ))}
          </motion.tbody>
        </motion.table>
      )}
    </div>
  );
};

export default CrudUsuariosCoordi;
