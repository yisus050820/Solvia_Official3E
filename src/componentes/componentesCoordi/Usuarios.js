import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Typography, Switch, TextField, Avatar } from '@mui/material';

const CrudUsuariosCoordi = () => {
  const [user, setUser] = useState([]);
  const [filtroRol, setFiltroRol] = useState('');
  const [mostrarCards, setMostrarCards] = useState(false);
  const [programasInscritos, setProgramasInscritos] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);

  // Función para truncar texto con puntos suspensivos y agregar punto al inicio
  const formatProgramName = (text, maxLength, truncate = false) => {
    if (!text) return '•';
    const truncated = truncate && text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
    return `• ${truncated}`;
  };

  // Función para truncar descripciones a 50 caracteres
  const truncateDescription = (description) => {
    if (!description) return '';
    return description.length > 50 ? `${description.slice(0, 50)}...` : description;
  };

  // Obtener usuarios y programas inscritos al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }

    const fetchUsuarios = axios.get('http://localhost:5000/user', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const fetchProgramasInscritos = axios.get('http://localhost:5000/user/asignaciones', {
      headers: { Authorization: `Bearer ${token}` },
    });

    Promise.all([fetchUsuarios, fetchProgramasInscritos])
      .then(([usuariosResponse, programasResponse]) => {
        setUser(usuariosResponse.data);

        // Crear un mapa de programas inscritos por usuario
        const programasMap = {};
        Object.entries(programasResponse.data).forEach(([userId, userData]) => {
          programasMap[userId] = userData.programas.map((program) => program.program_name);
        });

        setProgramasInscritos(programasMap);
      })
      .catch((error) => {
        console.error('Error fetching users or enrolled programs:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const sortedUser = [...user].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'email') return a.email.localeCompare(b.email);
    if (sortBy === 'created_at') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return 0;
  });

  const filteredUser = sortedUser.filter((user) => {
    const matchesSearchQuery = (
      user.name.toLowerCase().includes(searchQuery) ||
      user.email.toLowerCase().includes(searchQuery) ||
      (user.description && user.description.toLowerCase().includes(searchQuery))
    );
    const matchesRole = filtroRol === '' || user.role === filtroRol;

    return matchesSearchQuery && matchesRole;
  });

  return (
    <div className="w-full px-6 py-0.1 mx-auto mt-2">
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Usuarios
      </Typography>
      <div className="flex justify-between mb-4 space-x-4">
        <div className="flex space-x-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
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
              backgroundColor: 'white',
              color: 'black',
              borderRadius: '5px',
              '& .MuiOutlinedInput-root': {
                height: '36px',
                fontSize: '0.9rem',
                '& input': { color: 'black', padding: '8px 14px' },
                '& fieldset': { borderColor: '#ccc' },
                '&:hover fieldset': { borderColor: '#888' },
              },
              '& .MuiInputLabel-root': { color: '#888', fontSize: '0.9rem', top: '-6px' },
            }}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center">
          <Typography variant="body1" color="primary" className="mr-2">
            Ver en tarjetas
          </Typography>
          <Switch checked={mostrarCards} onChange={() => setMostrarCards(!mostrarCards)} color="primary" />
        </div>
      </div>
      {mostrarCards ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUser.map((item) => (
            <motion.div
              key={item.id}
              className="bg-gray-800 text-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Avatar
                src={`http://localhost:5000${item.profile_picture}?${new Date().getTime()}`}
                alt={item.name}
                className="shadow-lg mb-4"
                sx={{
                  width: 128,
                  height: 128,
                }}
              />
              <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
                {item.name}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                {item.email}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', marginTop: '8px' }}>
                {truncateDescription(item.description)}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', marginTop: '8px' }}>
                {programasInscritos[item.id]?.length ? (
                  <ul className="list-none">
                    {programasInscritos[item.id].map((prog, index) => (
                      <li key={index}>{formatProgramName(prog, 0)}</li> 
                    ))}
                  </ul>
                ) : (
                  'No inscrito en programas'
                )}
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
                  {programasInscritos[item.id]?.length ? (
                    <ul>
                      {programasInscritos[item.id].map((prog, index) => (
                        <li key={index}>{formatProgramName(prog, 10, true)}</li> 
                      ))}
                    </ul>
                  ) : (
                    'No inscrito'
                  )}
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </motion.table>
      )}
    </div>
  );
};

export default CrudUsuariosCoordi;
