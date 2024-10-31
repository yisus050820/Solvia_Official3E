import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, InputAdornment, IconButton, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; 
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Registro = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthDate] = useState(null);
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

  const navigate = useNavigate(); // Inicializar useNavigate

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

  const calculateAge = (birthdate) => {
    const diffMs = Date.now() - new Date(birthdate).getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Lista de campos obligatorios
    const missingFields = [];
    if (!name) missingFields.push('Nombre');
    if (!email) missingFields.push('Correo Electrónico');
    if (!password) missingFields.push('Contraseña');
    if (!confirmPassword) missingFields.push('Confirmar Contraseña');
    if (!role) missingFields.push('Rol');
    if (!description) missingFields.push('Descripción');
    if (!profilePicture) missingFields.push('Foto de Perfil');
    if (!termsAccepted) missingFields.push('Aceptar Términos y Condiciones');

    if (missingFields.length > 0) {
      setMessage(`Por favor, completa los siguientes campos: ${missingFields.join(', ')}`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

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

    const age = birthdate ? calculateAge(birthdate) : 0;
    
    if (role === 'beneficiary' && age < 9) {
      setMessage('El beneficiario debe tener al menos 9 años.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    } else if (role !== 'beneficiary' && age < 18) {
      setMessage('Los usuarios deben tener al menos 18 años.');
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

    // Enviar el formulario si no hay errores
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);
    formData.append('description', description);
    formData.append('profile_picture', profilePicture);
    formData.append('birth_date', birthdate)

    try {
      const response = await axios.post('http://localhost:5000/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Registro exitoso');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      // Redirigir al usuario a la página de login
      setTimeout(() => {
        navigate('/login'); // Redirección tras éxito
      }, 1000); // Esperar 2 segundos antes de redirigir

      // Limpiar los campos del formulario
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
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', backgroundImage: 'url(https://img.freepik.com/foto-gratis/superficie-azul-herramientas-estudio_23-2147864592.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', p: 2 }}>
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} transition={{ duration: 0.5 }}>
        <Paper elevation={10} sx={{ padding: { xs: 2, sm: 4 }, backgroundColor: '#2b2b2b', borderRadius: '16px', width: { xs: '100%', sm: '400px', md: '450px' },  marginRight: { xs: 0, sm: 3, md: 35 }, }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ color: '#ffffff' }}>Registro de Usuario</Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField margin="normal" fullWidth label="Nombre" value={name} onChange={(e) => setName(e.target.value)} required InputLabelProps={{ style: { color: '#b0b0b0' } }} InputProps={{ style: { color: '#ffffff' }, sx: { '& .MuiOutlinedInput-root': { '& fieldset': { borderRadius: '12px', borderColor: '#1a73e8' }, '&:hover fieldset': { borderColor: '#1a73e8' } } } }} />
            <TextField margin="normal" fullWidth label="Correo Electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required InputLabelProps={{ style: { color: '#b0b0b0' } }} InputProps={{ style: { color: '#ffffff' }, sx: { '& .MuiOutlinedInput-root': { '& fieldset': { borderRadius: '12px', borderColor: '#1a73e8' }, '&:hover fieldset': { borderColor: '#1a73e8' } } } }} />
            <TextField margin="normal" fullWidth label="Contraseña" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required InputLabelProps={{ style: { color: '#b0b0b0' } }} InputProps={{ style: { color: '#ffffff' }, endAdornment: (<InputAdornment position="end"><IconButton onClick={handleClickShowPassword} edge="end" sx={{ color: '#b0b0b0' }}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>), sx: { '& .MuiOutlinedInput-root': { '& fieldset': { borderRadius: '12px', borderColor: '#1a73e8' }, '&:hover fieldset': { borderColor: '#1a73e8' } } } }} />
            <TextField margin="normal" fullWidth label="Confirmar Contraseña" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required InputLabelProps={{ style: { color: '#b0b0b0' } }} InputProps={{ style: { color: '#ffffff' }, sx: { '& .MuiOutlinedInput-root': { '& fieldset': { borderRadius: '12px', borderColor: '#1a73e8' }, '&:hover fieldset': { borderColor: '#1a73e8' } } } }} />
            <DatePicker
              selected={birthdate}
              onChange={(date) => setBirthDate(date)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Fecha de nacimiento"
              className="w-full p-2 border border-gray-300 rounded bg-gray text-black"
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel sx={{ color: '#b0b0b0' }}>Rol</InputLabel>
              <Select value={role} onChange={(e) => setRole(e.target.value)} label="Rol" sx={{ color: '#ffffff', borderRadius: '12px', '& .MuiOutlinedInput-root': { '& fieldset': { borderRadius: '12px', borderColor: '#1a73e8' }, '&:hover fieldset': { borderColor: '#1a73e8' } } }}>
                <MenuItem value="donor">Donador</MenuItem>
                <MenuItem value="volunteer">Voluntario</MenuItem>
                <MenuItem value="beneficiary">Beneficiario</MenuItem>
              </Select>
            </FormControl>
            <TextField margin="normal" fullWidth label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} required InputLabelProps={{ style: { color: '#b0b0b0' } }} InputProps={{ style: { color: '#ffffff' }, sx: { '& .MuiOutlinedInput-root': { '& fieldset': { borderRadius: '12px', borderColor: '#1a73e8' }, '&:hover fieldset': { borderColor: '#1a73e8' } } } }} />
            <TextField margin="normal" fullWidth label="" type="file" onChange={(e) => setProfilePicture(e.target.files[0])} InputLabelProps={{ style: { color: '#b0b0b0' } }} InputProps={{ style: { color: '#ffffff' }, sx: { '& .MuiOutlinedInput-root': { '& fieldset': { borderRadius: '12px', borderColor: '#1a73e8' }, '&:hover fieldset': { borderColor: '#1a73e8' } } } }} />
            <FormControlLabel control={<Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} sx={{ color: '#1a73e8' }} />} label={<Typography variant="body2" sx={{ color: '#b0b0b0' }}>Acepto los{' '}<span onClick={handleTermsDialogOpen} style={{ color: '#1a73e8', cursor: 'pointer' }}>términos y condiciones</span></Typography>} sx={{ marginTop: 2 }} />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, backgroundColor: '#1a73e8', borderRadius: '12px', '&:hover': { backgroundColor: '#1664c1' } }}>Registrarse</Button>
          </Box>
          <Box mt={2} textAlign="center">
            <Typography variant="body2" sx={{ color: '#b0b0b0' }}>¿Ya tienes una cuenta?{' '}<Link to="/login" style={{ color: '#1a73e8', textDecoration: 'none' }}>Inicia sesión aquí</Link></Typography>
          </Box>
        </Paper>

        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>{message}</Alert>
        </Snackbar>

        <Dialog open={openTermsDialog} keepMounted onClose={handleTermsDialogClose} aria-labelledby="terms-dialog-title" aria-describedby="terms-dialog-description" PaperProps={{ sx: { backgroundColor: '#2b2b2b', borderRadius: '16px', padding: '16px' } }}>
          <DialogTitle id="terms-dialog-title" sx={{ color: '#ffffff' }}>Términos y Condiciones</DialogTitle>
          <DialogContent dividers><Typography id="terms-dialog-description" variant="body1" sx={{ color: '#b0b0b0' }}>
            
          1. Aceptación de los Términos
          Al acceder y utilizar nuestra plataforma, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo con alguno de ellos, te recomendamos no utilizar nuestros servicios.
          
          2. Registro de Usuario
          Para registrarte, debes proporcionar información precisa y veraz. Nos reservamos el derecho de suspender o cancelar tu cuenta si se detecta cualquier irregularidad o falsedad en los datos proporcionados.

          3. Protección de Datos
          Nos comprometemos a proteger tu privacidad y tus datos personales. La información que proporciones será utilizada únicamente para fines relacionados con el servicio, conforme a nuestra Política de Privacidad.

          4. Uso Aceptable
          Te comprometes a utilizar nuestra plataforma de manera responsable, sin realizar actividades ilegales, dañinas o que infrinjan los derechos de terceros. Nos reservamos el derecho de suspender cuentas que no cumplan con esta política.

          5. Responsabilidad
          Aunque nos esforzamos por ofrecer un servicio de calidad, no garantizamos la disponibilidad continua de la plataforma ni la ausencia de errores. No nos hacemos responsables por cualquier daño o pérdida derivada del uso de nuestros servicios.

          6. Modificaciones de los Términos
          Nos reservamos el derecho de actualizar o modificar estos términos en cualquier momento. Te notificaremos sobre cualquier cambio relevante. El uso continuado de nuestros servicios tras una modificación implica la aceptación de los nuevos términos.

          7. Contacto
          Si tienes alguna duda sobre estos términos, puedes contactarnos a través de los medios proporcionados en la plataforma.           
            </Typography></DialogContent>
          <DialogActions><Button onClick={handleTermsDialogClose} sx={{ color: '#1a73e8' }}>Cerrar</Button></DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  );
};

export default Registro;
