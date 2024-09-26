import React, { useState } from 'react';
import { Card, CardContent, Typography, Avatar, TextField, Grid, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { FaEdit, FaEnvelope, FaUserTag, FaUserCircle } from 'react-icons/fa';
import { Box } from '@mui/material';

const PerfilUsuario = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'John',
    email: 'Correo: john.doe@example.com',
    role: 'Coordinador',
    description: 'Descripción: Responsable de varios programas de ayuda social en la comunidad',
    profile_picture: 'https://via.placeholder.com/300', // Imagen de perfil predeterminada
  });

  const [editInfo, setEditInfo] = useState(userInfo);
  const [newProfilePicture, setNewProfilePicture] = useState(null);

  // Maneja los cambios en los campos de edición
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditInfo({ ...editInfo, [name]: value });
  };

  // Guarda los cambios de edición
  const handleSave = () => {
    if (newProfilePicture) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserInfo({ ...editInfo, profile_picture: reader.result });
        setIsEditing(false);
      };
      reader.readAsDataURL(newProfilePicture);
    } else {
      setUserInfo(editInfo);
      setIsEditing(false);
    }
  };

  // Maneja el cambio de la imagen de perfil
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePicture(file);
    }
  };

  // Animaciones suaves para botones
  const buttonVariants = {
    hover: { scale: 1.1, transition: { duration: 0.3 } },
    tap: { scale: 0.9, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="w-full mx-auto mt-5 px-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ backgroundColor: '#1e293b', color: '#fff', padding: '20px', borderRadius: '15px' }}>
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              {/* Imagen de perfil más grande */}
              <motion.div
                className="flex justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Avatar
                  src={userInfo.profile_picture}
                  alt={userInfo.name}
                  sx={{ width: 150, height: 150, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)' }}
                />
              </motion.div>
              {isEditing && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="contained"
                    component="label"
                    color="primary"
                    sx={{ backgroundColor: '#60b4c7', color: 'black' }}
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
            <Grid item xs={12} md={8}>
              {!isEditing ? (
                <div>
                  {/* Información del usuario */}
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
                  {/* Formulario de edición */}
                  <TextField
                    name="name"
                    value={editInfo.name}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    placeholder="Escribe tu nombre" // Placeholder para el campo de nombre
                    sx={{ backgroundColor: '#fff', borderRadius: '5px', mb: 2 }}
                    InputProps={{
                      style: { color: 'black' },
                    }}
                    InputLabelProps={{
                      shrink: true, // Esto fuerza que la etiqueta esté siempre arriba
                      style: { color: 'black', fontSize: '18px', fontWeight: 'bold' },
                    }}
                  />
                  <TextField
                    name="email"
                    value={editInfo.email}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    placeholder="Escribe tu correo" // Placeholder para el campo de correo
                    sx={{ backgroundColor: '#fff', borderRadius: '5px', mb: 2 }}
                    InputProps={{
                      style: { color: 'black' },
                    }}
                    InputLabelProps={{
                      shrink: true, // Esto fuerza que la etiqueta esté siempre arriba
                      style: { color: 'black', fontSize: '18px', fontWeight: 'bold' },
                    }}
                  />
                </>
              )}
            </Grid>
          </Grid>
          {/* Descripción y botones */}
          <div className="mt-6">
            {!isEditing ? (
              <Typography variant="body2" color="gray" gutterBottom sx={{ fontSize: '1.1rem' }}>
                {userInfo.description}
              </Typography>
            ) : (
              <TextField
                name="description"
                value={editInfo.description}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
                variant="outlined"
                margin="dense"
                placeholder="Agrega una descripción" // Placeholder para el campo de descripción
                sx={{ backgroundColor: '#fff', borderRadius: '5px', mb: 4 }}
                InputProps={{
                  style: { color: 'black' },
                }}
                InputLabelProps={{
                  shrink: true, // Esto fuerza que la etiqueta esté siempre arriba
                  style: { color: 'black', fontSize: '18px', fontWeight: 'bold' },
                }}
              />
            )}
            <div className="flex justify-end space-x-4">
              {!isEditing ? (
                <motion.button
                  className="bg-blue-500 text-white px-4 py-2 rounded-full"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit />
                </motion.button>
              ) : (
                <div className="flex space-x-4">
                  <motion.button
                    className="bg-green-500 text-white px-4 py-2 rounded-full"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleSave}
                  >
                    Guardar
                  </motion.button>
                  <motion.button
                    className="bg-red-500 text-white px-4 py-2 rounded-full"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setIsEditing(false)}
                  >
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
