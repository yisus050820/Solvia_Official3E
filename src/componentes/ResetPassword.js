import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Paper, Typography, Snackbar, Alert } from '@mui/material';

const ResetPassword = () => {
  const { token } = useParams(); // Obtenemos el token desde los parámetros de la URL
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const navigate = useNavigate();

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      // Enviamos la nueva contraseña y el token al backend
      const response = await axios.post(`http://localhost:5000/reset-password/${token}`, { password });
      setMessage('Contraseña restablecida con éxito');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setTimeout(() => navigate('/login'), 3000); // Redirigir al login tras 3 segundos
    } catch (error) {
      setMessage('Error al restablecer la contraseña');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: { xs: 2, sm: 4 },
          borderRadius: '16px',
          width: { xs: '100%', sm: '400px', md: '450px' },
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Restablecer Contraseña
        </Typography>
        <Box component="form" onSubmit={handleResetPassword} noValidate>
          <TextField
            margin="normal"
            fullWidth
            label="Nueva Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            label="Confirmar Contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
          >
            Restablecer Contraseña
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResetPassword;
