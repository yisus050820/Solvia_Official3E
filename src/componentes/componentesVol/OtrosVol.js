import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Typography, TextField, Avatar } from '@mui/material';

const UsuariosTarjeta = () => {
  const [user, setUser] = useState([]);
  const [filtroRol, setFiltroRol] = useState('');
  const [searchQuery, setSearchQuery] = useState("");
  const contentRef = useRef(null);

  const roleTranslation = {
    admin: 'Administrador',
    coordinator: 'Coordinador',
    volunteer: 'Voluntario',
    donor: 'Donante',
    beneficiary: 'Beneficiario',
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      return;
    }

    const fetchUsuarios = axios.get('http://localhost:5000/usuarios');

    fetchUsuarios
      .then((response) => {
        setUser(response.data);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredUser = user.filter((user) => {
    const matchesSearchQuery = (
      user.name.toLowerCase().includes(searchQuery) ||
      user.email.toLowerCase().includes(searchQuery) ||
      (user.description && user.description.toLowerCase().includes(searchQuery))
    );

    const matchesRole = filtroRol === '' || user.role === filtroRol;

    return matchesSearchQuery && matchesRole;
  });

  return (
    <>
      <div className="w-full px-6 py-4 mx-auto mt-2">
      <Typography variant="h3" align="center" color="primary" sx={{ marginBottom: 0 }}>
        Usuarios
      </Typography>

        <div className="flex justify-between mb-4 space-x-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <label htmlFor="filtroRol" style={{ color: '#383D3B', marginRight: '8px' }}>
              Filtrar por Rol:
            </label>
            <motion.select
              id="filtroRol"
              style={{
                backgroundColor: '#EEE5E9',
                color: '#383D3B',
                border: '1px solid #7C7C7C',
                padding: '8px',
                borderRadius: '5px',
              }}
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="admin">Administrador</option>
              <option value="coordinator">Coordinador</option>
              <option value="volunteer">Voluntario</option>
              <option value="donor">Donante</option>
              <option value="beneficiary">Beneficiario</option>
            </motion.select>
          </motion.div>

          <div className="flex items-center space-x-2" style={{ flex: 1 }}>
            <TextField
              fullWidth
              label="Buscar..."
              variant="outlined"
              sx={{
                backgroundColor: '#EEE5E9', // Fondo de input
                color: '#383D3B', // Texto del input
                borderRadius: '5px',
                '& .MuiOutlinedInput-root': {
                  height: '36px',
                  fontSize: '0.9rem',
                  '& input': { color: '#383D3B', padding: '8px 14px' },
                  '& fieldset': { borderColor: '#7C7C7C' },
                  '&:hover fieldset': { borderColor: '#383D3B' },
                  '&.Mui-focused fieldset': { borderColor: '#92DCE5' },
                },
                '& .MuiInputLabel-root': {
                  color: '#7C7C7C',
                  fontSize: '0.9rem',
                  top: '-6px',
                },
              }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div
          ref={contentRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto"
          style={{
            maxHeight: 'calc(100vh - 200px)',
          }}
        >
          {filteredUser.map((item) => (
            <motion.div
              key={item.id}
              style={{
                backgroundColor: '#383D3B',
                color: '#EEE5E9',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
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
                {roleTranslation[item.role] || item.role}
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
