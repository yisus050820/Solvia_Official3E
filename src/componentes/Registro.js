import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { TextField, Button, Typography, Box, Paper, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert, IconButton, InputAdornment, Checkbox, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, Slide } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Registro = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('volunteer');
  const [description, setDescription] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [openTermsDialog, setOpenTermsDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleTermsDialogOpen = () => {
    setOpenTermsDialog(true);
  };

  const handleTermsDialogClose = () => {
    setOpenTermsDialog(false);
  };

  // Función para validar el formato de correo electrónico
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validación de formato de correo electrónico
    if (!isValidEmail(email)) {
      setMessage('Por favor, introduce un correo electrónico válido.');
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
  
    // Validación de coincidencia de contraseñas
    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
  
    // Validación de campos obligatorios
    if (!name || !email || !password || !role || !description || !profilePicture || !termsAccepted) {
      let missingFields = [];
      if (!name) missingFields.push('Nombre');
      if (!email) missingFields.push('Correo Electrónico');
      if (!password) missingFields.push('Contraseña');
      if (!role) missingFields.push('Rol');
      if (!description) missingFields.push('Descripción');
      if (!profilePicture) missingFields.push('Foto de Perfil');
      if (!termsAccepted) missingFields.push('Aceptar Términos y Condiciones');
  
      setMessage(`Por favor, completa los siguientes campos: ${missingFields.join(', ')}`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
  
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);
    formData.append('description', description);
    formData.append('profile_picture', profilePicture);
  
    try {
      const response = await axios.post('http://localhost:5000/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Registro exitoso');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('volunteer');
      setDescription('');
      setProfilePicture(null);
      setTermsAccepted(false);
    } catch (error) {
      if (error.response && error.response.data.message === 'Correo ya registrado') {
        setMessage('El correo electrónico ya está registrado.');
      } else {
        setMessage('Error al intentar registrarse. Por favor, inténtalo de nuevo.');
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
        backgroundImage: 'url(URL_DE_TU_IMAGEN_DE_FONDO)',
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
            Registro de Usuario
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              fullWidth
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <TextField
              margin="normal"
              fullWidth
              label="Confirmar Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            <FormControl fullWidth margin="normal" required>
              <InputLabel sx={{ color: '#b0b0b0' }}>Rol</InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                label="Rol"
                sx={{
                  color: '#ffffff',
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: '12px',
                      borderColor: '#1a73e8',
                    },
                    '&:hover fieldset': {
                      borderColor: '#1a73e8',
                    },
                  },
                }}
              >
                <MenuItem value="donor">Donador</MenuItem>
                <MenuItem value="volunteer">Voluntario</MenuItem>
                <MenuItem value="beneficiary">Beneficiario</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              label=""
              type="file"
              onChange={(e) => setProfilePicture(e.target.files[0])}
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  sx={{ color: '#1a73e8' }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  Acepto los{' '}
                  <span onClick={handleTermsDialogOpen} style={{ color: '#1a73e8', cursor: 'pointer' }}>
                    términos y condiciones
                  </span>
                </Typography>
              }
              sx={{ marginTop: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, backgroundColor: '#1a73e8', borderRadius: '12px', '&:hover': { backgroundColor: '#1664c1' } }}
            >
              Registrarse
            </Button>
          </Box>
          <Box mt={2} textAlign="center">
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" style={{ color: '#1a73e8', textDecoration: 'none' }}>
                Inicia sesión aquí
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

        <Dialog
          open={openTermsDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleTermsDialogClose}
          aria-labelledby="terms-dialog-title"
          aria-describedby="terms-dialog-description"
          PaperProps={{
            sx: {
              backgroundColor: '#2b2b2b',
              borderRadius: '16px',
              padding: '16px',
            },
          }}
        >
          <DialogTitle id="terms-dialog-title" sx={{ color: '#ffffff' }}>Términos y Condiciones</DialogTitle>
          <DialogContent dividers>
            <Typography id="terms-dialog-description" variant="body1" sx={{ color: '#b0b0b0' }}>
              Aquí va el texto de los términos y condiciones.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleTermsDialogClose} sx={{ color: '#1a73e8' }}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  );
};

export default Registro;

