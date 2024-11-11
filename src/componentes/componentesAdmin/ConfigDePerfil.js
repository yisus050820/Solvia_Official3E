import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaEnvelope, FaUserTag, FaUserCircle, FaDoorOpen, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import { Card, CardContent, Avatar, Grid, Typography, TextField, Button, Snackbar, Alert, InputAdornment, IconButton } from '@mui/material';

const PerfilUsuario = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [editInfo, setEditInfo] = useState({});
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito


  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Obtener la información del usuario al cargar el componente
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No se encontró el token.');
          setLoading(false);
          return;
        }
  
        const response = await axios.get('http://localhost:5000/perfil/', {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        if (response.data) {
          setUserInfo(response.data);
        } else {
          console.error('Datos de perfil vacíos');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);  

  //Aniamcion de exito al actualizar datos de perfil
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        setSuccessMessage('');
      }, 1000); // El mensaje desaparecerá después de 1 segundos, se mide en ms
    }
  }, [successMessage]);

  // Controlar los cambios en los campos de edición
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditInfo({ ...editInfo, [name]: value });
  };

  const calculateAge = (birthdate) => {
    const diffMs = Date.now() - new Date(birthdate).getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Guardar los cambios en el perfil
  const handleSave = async () => {
    const validationErrors = {};
  
    // Calcular la edad del usuario con la fecha de nacimiento proporcionada
    const age = editInfo.birthdate ? calculateAge(editInfo.birthdate) : 0;
  
    // Validar la edad basada en el rol del usuario
    if (userInfo.role === 'beneficiary' && age < 9) {
      validationErrors.birthdate = 'El beneficiario debe tener al menos 9 años.';
    } else if (userInfo.role !== 'beneficiary' && age < 18) {
      validationErrors.birthdate = 'Los usuarios deben tener al menos 18 años.';
    }
  
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSnackbarSeverity('error');
      setMessage(validationErrors.birthdate);
      setOpenSnackbar(true);
      return;
    }
  
    const formData = new FormData();
  
    // Agregar los campos modificados o los valores actuales al formData
    formData.append('name', editInfo.name || userInfo.name);
    formData.append('email', editInfo.email || userInfo.email);
    formData.append('description', editInfo.description || userInfo.description);
    formData.append('birth_date', editInfo.birthdate || userInfo.birth_date);
  
    if (password) {
      if (password.length < 8) {
        setMessage('La contraseña debe tener al menos 8 caracteres.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return;
      }
      formData.append('password', password);
    }
  
    // Agregar la imagen solo si el usuario seleccionó una nueva imagen
    if (newProfilePicture) {
      formData.append('profile_picture', newProfilePicture);
    }
  
    const token = localStorage.getItem('token');
  
    try {
      const response = await axios.put(`http://localhost:5000/perfil/usuarios`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      setUserInfo(response.data);
      setIsEditing(false);
      setPassword('');
      setErrors({ email: '', password: '', birthdate: '' });
      setSuccessMessage('Datos actualizados exitosamente.');
  
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
  
  // Validar el tamaño del archivo de imagen antes de subirlo
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 1024 * 1024) {  // Limitar a 1MB
      setMessage('El tamaño de la imagen no debe exceder 1MB.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    setNewProfilePicture(file);
  };

  const handleLogout = () => {
    localStorage.clear();  // Limpiar localStorage completamente
    delete axios.defaults.headers.common['Authorization'];  // Limpiar encabezados globales
    window.location.href = '/index';  // Redirigir a la página de inicio o login
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setEditInfo({
      name: userInfo.name,
      email: userInfo.email,
      description: userInfo.description,
      birthdate: userInfo.birth_date,
    });
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
                  src={`http://localhost:5000${userInfo.profile_picture}?${new Date().getTime()}`}
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
                  {/* Mostrar la fecha de nacimiento en modo visualización */}
                  <Typography variant="subtitle2" color="gray" sx={{ fontSize: '1rem', marginTop: '4px' }}>
                    Fecha de nacimiento: {userInfo.birth_date || 'No disponible'}
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
                    sx={{ backgroundColor: 'white', color: 'black', borderRadius: '5px', mb: 2, input: { color: 'black' } }}
                  />
                  <TextField
                    name="birthdate"
                    type="date"
                    value={editInfo.birthdate || ''}  // Mostrará la fecha de nacimiento actual o vacío si no existe
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    placeholder="Fecha de nacimiento"
                    sx={{ backgroundColor: 'white', color: 'black', borderRadius: '5px', mb: 2, input: { color: 'black' } }}
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
                    sx={{ backgroundColor: 'white', borderRadius: '5px', mb: 2, input: { color: 'black' }, color: 'black' }}
                  />
                  {/* Campo de contraseña */}
                  <TextField
                    name="password"
                    type={showPassword ? 'text' : 'password'}
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
                    sx={{ backgroundColor: 'white', borderRadius: '5px', mb: 2, input: { color: 'black' } }}
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
                value={editInfo.description || ''}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                margin="dense"
                placeholder="Agrega una descripción"
                sx={{ backgroundColor: 'white', color: 'black', borderRadius: '5px', mb: 2, input: { color: 'black' } }}
              />
            )}
            <div className="flex justify-end space-x-4">
              {!isEditing ? (
                <>
                  <motion.button
                    className="bg-blue-500 text-white px-4 py-2 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleEdit}>
                    <FaEdit />
                  </motion.button>
                  <motion.button
                    className="bg-red-500 text-white px-4 py-2 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLogout}>
                    <FaDoorOpen />
                  </motion.button>
                </>
              ) : (
                <div className="flex space-x-4">
                  <motion.button
                    className="bg-green-500 text-white px-4 py-2 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSave}>
                    Guardar
                  </motion.button>
                  <motion.button
                    className="bg-red-500 text-white px-4 py-2 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditing(false)}>
                    Cancelar
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
      {/* Modal para mensajes de éxito */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeIn" }}  // Animaciones de entrada/salida
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}  // Efecto de resorte en la entrada/salida
              className="bg-gray-800 p-6 rounded-xl shadow-lg">
              {/* Icono de palomita */}
              <h2 className="text-white text-2xl font-bold mb-4">{successMessage}</h2>
              <div className='flex justify-center items-center'>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0, pathLength: 0 },
                    visible: { opacity: 1, pathLength: 1 },
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className='flex justify-center items-center'
                  style={{
                    borderRadius: '50%',        // Hace que sea un círculo
                    backgroundColor: '#4CAF50', // Color de fondo verde
                    width: '80px',              // Tamaño del círculo
                    height: '80px',             // Tamaño del círculo
                    display: 'flex',            // Para alinear el contenido
                    justifyContent: 'center',   // Centra horizontalmente
                    alignItems: 'center'        // Centra verticalmente
                  }}
                >
                  <FaCheck size={50} className="text-white" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default PerfilUsuario;