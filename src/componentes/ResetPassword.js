import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Paper, Typography, Snackbar, Alert, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { token } = useParams(); // Obtenemos el token desde los parámetros de la URL
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const navigate = useNavigate();

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Validación de longitud mínima de contraseña
    if (password.length < 8) {
      setMessage('La contraseña debe tener al menos 8 caracteres.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      // Enviamos la nueva contraseña y el token al backend
      const response = await axios.post(`http://localhost:5000/resetPassword/reset/${token}`, { password });
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
          
        <TextField margin="normal" fullWidth label="Contraseña" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required InputLabelProps={{ style: { color: '#b0b0b0' } }} InputProps={{ style: { color: 'black' }, endAdornment: (<InputAdornment position="end"><IconButton onClick={handleClickShowPassword} edge="end" sx={{ color: '#b0b0b0' }}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>), sx: { '& .MuiOutlinedInput-root': { '& fieldset': { borderRadius: '12px', borderColor: '#1a73e8' }, '&:hover fieldset': { borderColor: '#1a73e8' } } } }} />
            <TextField margin="normal" fullWidth label="Confirmar Contraseña" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required InputLabelProps={{ style: { color: '#b0b0b0' } }} InputProps={{ style: { color: 'black' }, sx: { '& .MuiOutlinedInput-root': { '& fieldset': { borderRadius: '12px', borderColor: '#1a73e8' }, '&:hover fieldset': { borderColor: '#1a73e8' } } } }} />
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
