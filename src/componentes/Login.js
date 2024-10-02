import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Importar useNavigate
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
  const navigate = useNavigate(); // Definir useNavigate para las redirecciones

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/login', { // Asegúrate de que la URL esté correcta
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
  
      if (response.ok) {
        // Si la respuesta es válida
        console.log('Login successful:', data);
        // Aquí puedes redirigir según el rol o guardar el token
      } else {
        console.error('Error during login:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage('Por favor, complete todos los campos.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      const { token, role } = response.data; // Obtener el token y el rol
      localStorage.setItem('token', token); // Almacenar el token
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
          navigate('/DonadorCrud'); // Asegúrate de tener esta ruta configurada
          break;
        case 'volunteer':
          navigate('/'); // Asegúrate de tener esta ruta configurada
          break;
        case 'beneficiary':
          navigate('/BeneficiarioCrud'); // Asegúrate de tener esta ruta configurada
          break;
        case 'coordinator':
          navigate('/CoordiCrud'); // Asegúrate de tener esta ruta configurada
          break;
        default:
          navigate('/'); // Redirigir a una ruta por defecto
      }
    } catch (error) {
      if (error.response) {
        if (error.response.data.message === 'Correo no encontrado') {
          setMessage('El correo electrónico no está registrado.');
        } else if (error.response.data.message === 'Contraseña incorrecta') {
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url('URL_DE_TU_IMAGEN_DE_FONDO')`,
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
              ¿No tienes una cuenta?{' '}
              <Link to="/register" style={{ color: '#1a73e8', textDecoration: 'none' }}>
                Regístrate aquí
              </Link>
            </Typography>
          </Box>
        </Paper>

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
