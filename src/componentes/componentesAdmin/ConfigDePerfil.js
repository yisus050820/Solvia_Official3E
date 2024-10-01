import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Avatar, TextField, Grid, Button, IconButton, InputAdornment } from '@mui/material';
import { motion } from 'framer-motion';
import { FaEdit, FaEnvelope, FaUserTag, FaUserCircle, FaDoorOpen, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const PerfilUsuario = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [editInfo, setEditInfo] = useState({});
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [password, setPassword] = useState(''); // Estado para la nueva contraseña
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(true);

  // Obtener la información del usuario al cargar el componente
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/perfil', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        setUserInfo(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Controlar los cambios en los campos de edición
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditInfo({ ...editInfo, [name]: value });
  };

  // Guardar los cambios en el perfil
  const handleSave = async () => {
    const formData = new FormData();
    formData.append('name', editInfo.name);
    formData.append('email', editInfo.email);
    formData.append('description', editInfo.description);
    if (newProfilePicture) {
      formData.append('profile_picture', newProfilePicture);
    }

    // Si se ha ingresado una nueva contraseña
    if (password) {
      formData.append('password', password);
    }

    try {
      const response = await axios.put('/perfil', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUserInfo(response.data);
      setIsEditing(false);
      setPassword('');  // Limpiar la contraseña después de guardar
      setErrors({ email: '', password: '' }); // Limpiar los errores si se guardó con éxito
    } catch (error) {
      if (error.response && error.response.data) {
        const { message } = error.response.data;
        if (message.includes('correo')) {
          setErrors({ ...errors, email: message });
        } else if (message.includes('contraseña')) {
          setErrors({ ...errors, password: message });
        }
      }
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePicture(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    // Al hacer clic en editar, copia los datos actuales del perfil al estado de edición
    setEditInfo(userInfo);
  };

  // Si aún está cargando, mostramos un mensaje de carga
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si no hay información del usuario, mostrar un mensaje de error o vacío
  if (!userInfo) {
    return <div>No se pudo cargar la información del usuario.</div>;
  }

  return (
    <motion.div className="w-full mx-auto mt-5 px-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card sx={{ backgroundColor: '#1e293b', color: '#fff', padding: '20px', borderRadius: '15px' }}>
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <motion.div className="flex justify-center" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                <Avatar
                  src={userInfo.profile_picture}
                  alt={userInfo.name}
                  sx={{ width: 150, height: 150, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)' }}
                />
              </motion.div>
              {isEditing && (
                <div className="mt-4 flex justify-center">
                  <Button variant="contained" component="label" color="primary" sx={{ backgroundColor: '#60b4c7', color: 'black' }}>
                    Cambiar Foto
                    <input type="file" accept="image/*" onChange={handleProfilePictureChange} hidden />
                  </Button>
                </div>
              )}
            </Grid>
            <Grid item xs={12} md={8}>
              {!isEditing ? (
                <div>
                  <Typography variant="h4" color="white" sx={{ fontSize: '2rem' }}>
                    <FaUserCircle className="inline-block text-blue-500 mr-2" />
                    {userInfo.name}
                  </Typography>
                  <Typography variant="subtitle1" color="gray" sx={{ fontSize: '1.2rem' }}>
                    <FaUserTag className="inline-block text-green-500 mr-2" />
                    {userInfo.role}
                  </Typography>
                  <Typography variant="body1" color="gray" sx={{ fontSize: '1.1rem' }}>
                    <FaEnvelope className="inline-block text-yellow-500 mr-2" />
                    {userInfo.email}
                  </Typography>
                </div>
              ) : (
                <>
                  <TextField
                    name="name"
                    value={editInfo.name || ''}  // Asegurarse de que no sea undefined
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    placeholder="Escribe tu nombre"
                    sx={{ backgroundColor: 'black', borderRadius: '5px', mb: 2 }}
                  />
                  <TextField
                    name="email"
                    value={editInfo.email || ''}  // Asegurarse de que no sea undefined
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    placeholder="Escribe tu correo"
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={{ backgroundColor: 'black', borderRadius: '5px', mb: 2 }}
                  />
                  {/* Campo de contraseña */}
                  <TextField
                    name="password"
                    type={showPassword ? 'text' : 'password'}  // Alternar entre mostrar y ocultar contraseña
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    placeholder="Nueva contraseña (opcional)"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ backgroundColor: 'black', borderRadius: '5px', mb: 2 }}
                    error={!!errors.password}
                    helperText={errors.password}
                  />
                </>
              )}
            </Grid>
          </Grid>
          <div className="mt-6">
            {!isEditing ? (
              <Typography variant="body2" color="gray" gutterBottom sx={{ fontSize: '1.1rem' }}>
                {userInfo.description}
              </Typography>
            ) : (
              <TextField
                name="description"
                value={editInfo.description || ''}  // Asegurarse de que no sea undefined
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                margin="dense"
                placeholder="Agrega una descripción"
                sx={{ backgroundColor: 'black', borderRadius: '5px', mb: 4 }}
              />
            )}
            <div className="flex justify-end space-x-4">
              {!isEditing ? (
                <>
                  <motion.button className="bg-blue-500 text-white px-4 py-2 rounded-full" onClick={toggleEdit}>
                    <FaEdit />
                  </motion.button>
                  <motion.button className="bg-red-500 text-white px-4 py-2 rounded-full" onClick={handleLogout}>
                    <FaDoorOpen />
                  </motion.button>
                </>
              ) : (
                <div className="flex space-x-4">
                  <motion.button className="bg-green-500 text-white px-4 py-2 rounded-full" onClick={handleSave}>
                    Guardar
                  </motion.button>
                  <motion.button className="bg-red-500 text-white px-4 py-2 rounded-full" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PerfilUsuario;
