import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaEnvelope, FaUserTag, FaUserCircle, FaDoorOpen, FaEye, FaEyeSlash, FaCheck, FaCalendarAlt } from 'react-icons/fa';
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
    <motion.div
      className="w-full max-w-4xl mx-auto mt-10 px-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          backgroundColor: "#383D3B",
          color: "#EEE5E9",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
        }}
      >
        <CardContent>
          <Grid container spacing={6} alignItems="center">
            {/* Avatar Section */}
            <Grid item xs={12} md={4} className="text-center">
              <motion.div
                className="relative inline-block"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Avatar
                  src={`http://localhost:5000${userInfo.profile_picture}?${new Date().getTime()}`}
                  alt={userInfo.name}
                  sx={{
                    width: 180,
                    height: 180,
                    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.5)",
                    border: "4px solid #92DCE5",
                  }}
                />
              </motion.div>
              {isEditing && (
                <div className="mt-4">
                  <Button
                    variant="contained"
                    component="label"
                    sx={{
                      backgroundColor: "#92DCE5",
                      color: "#383D3B",
                      fontWeight: "bold",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      textTransform: "none",
                    }}
                  >
                    Cambiar Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      hidden
                    />
                  </Button>
                </div>
              )}
            </Grid>

            {/* User Information */}
            <Grid item xs={12} md={8}>
              {!isEditing ? (
                <div>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: "2.2rem",
                      fontWeight: "600",
                      color: "#EEE5E9",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FaUserCircle className="mr-3 text-blue-300" />
                    {userInfo.name}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "#7C7C7C",
                      marginBottom: "8px",
                      fontSize: "1.2rem",
                    }}
                  >
                    <FaCalendarAlt className="mr-3 text-red-400" />
                    {userInfo.birth_date || "No disponible"}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "#7C7C7C",
                      marginBottom: "8px",
                      fontSize: "1.2rem",
                    }}
                  >
                    <FaUserTag className="mr-3 text-green-400" />
                    {userInfo.role}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "#7C7C7C",
                      fontSize: "1.2rem",
                    }}
                  >
                    <FaEnvelope className="mr-3 text-yellow-500" />
                    {userInfo.email}
                  </Typography>
                </div>
              ) : (
                <>
                  <TextField
                    name="name"
                    value={editInfo.name || ""}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    placeholder="Nombre completo"
                    sx={{
                      backgroundColor: "#EEE5E9",
                      borderRadius: "8px",
                      input: { color: "#383D3B", fontSize: "1.1rem" },
                    }}
                  />
                  <TextField
                    name="birthdate"
                    type="date"
                    value={editInfo.birthdate || ""}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    placeholder="Fecha de nacimiento"
                    sx={{
                      backgroundColor: "#EEE5E9",
                      borderRadius: "8px",
                      input: { color: "#383D3B", fontSize: "1.1rem" },
                      marginTop: "16px",
                    }}
                  />
                  <TextField
                    name="email"
                    value={editInfo.email || ""}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    placeholder="Correo electrónico"
                    sx={{
                      backgroundColor: "#EEE5E9",
                      borderRadius: "8px",
                      input: { color: "#383D3B", fontSize: "1.1rem" },
                      marginTop: "16px",
                    }}
                  />
                  <TextField
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    placeholder="Nueva contraseña"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      backgroundColor: "#EEE5E9",
                      borderRadius: "8px",
                      input: { color: "#383D3B", fontSize: "1.1rem" },
                      marginTop: "16px",
                    }}
                  />
                </>
              )}
            </Grid>
          </Grid>

          {/* Description Section */}
          <div className="mt-8">
            {!isEditing ? (
              <Typography
                variant="body2"
                sx={{
                  fontSize: "1.3rem",
                  color: "#7C7C7C",
                  lineHeight: 1.8,
                  textAlign: "justify",
                }}
              >
                {userInfo.description || "Sin descripción disponible."}
              </Typography>
            ) : (
              <TextField
                name="description"
                value={editInfo.description || ""}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                margin="dense"
                placeholder="Escribe una descripción breve"
                multiline
                rows={3}
                sx={{
                  backgroundColor: "#EEE5E9",
                  borderRadius: "8px",
                  input: { color: "#383D3B", fontSize: "1.1rem" },
                }}
              />
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 mt-10">
            {!isEditing ? (
              <>
                <motion.button
                  className="px-6 py-3 rounded-lg font-bold text-white"
                  style={{ backgroundColor: "#0097A7" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleEdit}
                >
                  <FaEdit className="mr-2" />
                  
                </motion.button>
                <motion.button
                  className="px-6 py-3 rounded-lg font-bold text-white"
                  style={{ backgroundColor: "#E63946" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                >
                  <FaDoorOpen className="mr-2" />
                  
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  className="px-6 py-3 rounded-lg font-bold text-white"
                  style={{ backgroundColor: "#0097A7" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                >
                  Guardar
                </motion.button>
                <motion.button
                  className="px-6 py-3 rounded-lg font-bold text-white"
                  style={{ backgroundColor: "#E63946" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </motion.button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default PerfilUsuario;