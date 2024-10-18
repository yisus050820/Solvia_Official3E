import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Paper, Snackbar, Alert, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [resetEmail, setResetEmail] = useState(''); // Estado para el correo de recuperación
  const [showResetForm, setShowResetForm] = useState(false); // Estado para mostrar el modal de restablecimiento
  const navigate = useNavigate();

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Manejador para el login
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage('Por favor, complete todos los campos.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (!isValidEmail(email)) {
      setMessage('Por favor, introduce un correo electrónico válido.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      console.log(email, password);
      const response = await axios.post('http://localhost:5000/login', { email, password });
      const { token, role } = response.data;
      localStorage.setItem('token', token);
      setMessage('Inicio de sesión exitoso');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setEmail('');
      setPassword('');

      // Redirigir según el rol
      switch (role) {
        case 'admin':
          navigate('/Admin');
          break;
        case 'donor':
          navigate('/DonadorCrud'); 
          break;
        case 'volunteer':
          navigate('/VoluntarioCrud'); 
          break;
        case 'beneficiary':
          navigate('/BeneficiarioCrud'); 
          break;
        case 'coordinator':
          navigate('/CoordiCrud'); 
          break;
        default:
          navigate('/'); // Redirigir a una ruta por defecto
      }
    } catch (error) {
      if (error.response) {
        if (error.response.data.message === 'Usuario no encontrado.') {
          setMessage('El correo electrónico no está registrado.');
        } else if (error.response.data.message === 'Contraseña incorrecta.') {
          setMessage('La contraseña ingresada es incorrecta.');
        } else {
          setMessage('Error al intentar iniciar sesión. Por favor, inténtalo de nuevo.');
        }
      } else {
        setMessage('Error al intentar iniciar sesión. Por favor, inténtalo de nuevo.');
      }
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  // Manejador para enviar el formulario de restablecimiento de contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    console.log('Info correctamente proporcionada'); // Log para verificar el correo

    if (!isValidEmail(resetEmail)) {
      setMessage('Por favor, introduce un correo electrónico válido.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      // Enviar la solicitud al backend para generar el token y enviar el correo de restablecimiento
      const response = await axios.post('http://localhost:5000/resetPassword', { email: resetEmail });
      console.log('Info enviada desde el front al back');
      setMessage('Correo de restablecimiento enviado. Revisa tu bandeja de entrada.');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setShowResetForm(false); // Cerrar el formulario
    } catch (error) {
      if (error.response) {
        if (error.response.data.message === 'Error en el servidor.') {
          setMessage('Error en el servidor.');
        } else if (error.response.data.message === 'Usuario no encontrado.') {
          setMessage('Usuario no encontrado.');
        } else {
          setMessage('Error');
        }
      } else {
        setMessage('Error al enviar el correo de restablecimiento.');
      }
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
        justifyContent: 'flex-end',
        backgroundImage: `url('https://img.freepik.com/foto-gratis/superficie-azul-herramientas-estudio_23-2147864592.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={10}
          sx={{
            padding: { xs: 2, sm: 4 },
            backgroundColor: '#2b2b2b',
            borderRadius: '16px',
            width: { xs: '100%', sm: '400px', md: '450px' },
            marginRight: { xs: 0, sm: 3, md: 35 }, 
          }}
        >
          <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ color: '#ffffff' }}>
            Inicio de Sesión
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              fullWidth
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputLabelProps={{ style: { color: '#b0b0b0' } }}
              InputProps={{
                style: { color: '#ffffff' },
                sx: {
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: '12px',
                      borderColor: '#1a73e8',
                    },
                    '&:hover fieldset': {
                      borderColor: '#1a73e8',
                    },
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputLabelProps={{ style: { color: '#b0b0b0' } }}
              InputProps={{
                style: { color: '#ffffff' },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      sx={{ color: '#b0b0b0' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: '12px',
                      borderColor: '#1a73e8',
                    },
                    '&:hover fieldset': {
                      borderColor: '#1a73e8',
                    },
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, backgroundColor: '#1a73e8', borderRadius: '12px', '&:hover': { backgroundColor: '#1664c1' } }}
            >
              Iniciar Sesión
            </Button>
          </Box>
          <Box mt={2} textAlign="center">
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
              <Button onClick={() => setShowResetForm(true)} sx={{ color: '#1a73e8' }}>
                ¿Olvidaste tu contraseña?
              </Button>
            </Typography>
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
              ¿No tienes una cuenta?{' '}
              <Link to="/register" style={{ color: '#1a73e8', textDecoration: 'none' }}>
                Regístrate aquí
              </Link>
            </Typography>
          </Box>
        </Paper>

        {/* Modal para el formulario de restablecimiento de contraseña */}
        {showResetForm && (
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              p: 4,
              boxShadow: 24,
              zIndex: 1000,
              borderRadius: '10px',
            }}
          >
            <Typography variant="h6" align="center">
              Restablecer Contraseña
            </Typography>
            <form onSubmit={handleResetPassword}>
              <TextField
                margin="normal"
                fullWidth
                label="Correo Electrónico"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Enviar correo de restablecimiento
              </Button>
              <Button onClick={() => setShowResetForm(false)} sx={{ mt: 2 }}>
                Cerrar
              </Button>
            </form>
          </Box>
        )}

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
      </motion.div>
    </Box>
  );
};

export default Login;
