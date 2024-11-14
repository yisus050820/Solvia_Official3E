import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Typography, TextField, Avatar } from '@mui/material';

const UsuariosTarjeta = () => {
  const [user, setUser] = useState([]);
  const [filtroRol, setFiltroRol] = useState('');
  const [programasInscritos, setProgramasInscritos] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);

  // Traducción de roles para la búsqueda en español
  const roleTranslation = {
    admin: 'administrador',
    coordinator: 'coordinador',
    volunteer: 'voluntario',
    donor: 'donante',
    beneficiary: 'beneficiario'
  };

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }
    
    const fetchUsuarios = axios.get('http://localhost:5000/usuarios');
    const fetchProgramasInscritos = axios.get('http://localhost:5000/asigBenProg/asignaciones');

    Promise.all([fetchUsuarios, fetchProgramasInscritos])
      .then(([usuariosResponse, programasResponse]) => {
        setUser(usuariosResponse.data);

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

  // Filtrar usuarios por el término de búsqueda en nombre, rol (traducido), email y descripción
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
    <>
      <div className="w-full px-6 py-0.1 mx-auto mt-2">
        <Typography variant="h3" align="center" color="primary" gutterBottom>
          Usuarios
        </Typography>

        <div className="flex justify-between mb-4 space-x-4">
          {/* Filtro por Rol */}
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

          {/* Campo de búsqueda */}
          <div className="flex items-center space-x-2">
            <TextField
              fullWidth
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
                  '& input': {
                    color: 'black',
                    padding: '8px 14px',
                  },
                  '& fieldset': {
                    borderColor: '#ccc',
                  },
                  '&:hover fieldset': {
                    borderColor: '#888',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#888',
                  fontSize: '0.9rem',
                  top: '-6px',
                },
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Mostrar contenido en tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUser.map((item) => (
            <motion.div
              key={item.id}
              className="bg-gray-800 text-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-center items-center">
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
              </div>
              <Typography variant="h5" gutterBottom className="flex justify-center">
                {item.name}
              </Typography>
              <Typography variant="body1" gutterBottom className="flex justify-center">
                {roleTranslation[item.role] || item.role} {/* Mostrar el rol en español */}
              </Typography>
              <Typography variant="body2" gutterBottom className="flex justify-center">
                {item.email}
              </Typography>
              <Typography variant="body2" className="text-center">
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
