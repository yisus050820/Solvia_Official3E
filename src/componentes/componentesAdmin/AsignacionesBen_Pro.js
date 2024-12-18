import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert, IconButton, InputAdornment } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrashAlt, FaEdit, FaCheck } from 'react-icons/fa';

const AsignacionesBen_Pro = () => {
  const [beneficiarioSeleccionado, setBeneficiarioSeleccionado] = useState('');
  const [programaSeleccionado, setProgramaSeleccionado] = useState('');
  const [asignaciones, setAsignaciones] = useState([]);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [editAsignacion, setEditAsignacion] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [message, setMessage] = useState('');
  const [errorBeneficiario, setErrorBeneficiario] = useState('');
  const [errorPrograma, setErrorPrograma] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [atBottom, setAtBottom] = useState(true);
  const userListRef = useRef(null);

  const handleScroll = () => {
    const userListContainer = userListRef.current;
    if (userListContainer) {
      setAtBottom(userListContainer.scrollHeight - userListContainer.scrollTop === userListContainer.clientHeight);
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Limpiar datos almacenados
    delete axios.defaults.headers.common['Authorization']; // Limpiar encabezados globales
    window.location.href = '/index'; // Redirigir a la página de inicio
  };

  useEffect(() => {
    const userListContainer = userListRef.current;
    if (userListContainer && atBottom) {
      userListContainer.scrollTop = userListContainer.scrollHeight;
    }
  }, [asignaciones, atBottom]); // Solo desplazarse al fondo si estamos al final  

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Variantes de animación para la palomita
  const checkmarkVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: { opacity: 1, pathLength: 1 },
  };

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }

    axios.get('http://localhost:5000/asigBenProg/beneficiarios')
      .then(res => {
        setBeneficiarios(res.data);
      })
      .catch(err =>
        console.error('Error fetching beneficiaries:', err),
        setLoading(false)
      );

    axios.get('http://localhost:5000/asigBenProg/programas')
      .then(res => {
        setProgramas(res.data);
      })
      .catch(err =>
        console.error('Error fetching programs:', err),
        setLoading(false));

    axios.get('http://localhost:5000/asigBenProg/asignaciones')
      .then(res => {
        setAsignaciones(res.data);
      })
      .catch(err => console.error('Error fetching assignments:', err),
        setLoading(false));
  }, []);

  const truncateDescription = (description) => {
    if (!description) return '';
    return description.length > 50 ? description.slice(0, 50) + '...' : description;
  };

  //Alerta se cierra automaticamente despues de 5 segundos
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        setSuccessMessage('');
      }, 1000); // definir en cuanto tiempo desaparecera la alerta, se mide en ms (3 segundos)

    }
  }, [successMessage]);

  const handleAsignar = () => {

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }

    let isValid = true;
    setErrorBeneficiario('');
    setErrorPrograma('');

    if (!beneficiarioSeleccionado) {
      setMessage('Debes seleccionar un beneficiario.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (!programaSeleccionado) {
      setMessage('Debes seleccionar un programa.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const nuevaAsignacion = {
      user_id: beneficiarioSeleccionado,
      program_id: programaSeleccionado
    };

    axios.post('http://localhost:5000/asigBenProg/beneficiarios', nuevaAsignacion)
      .then((res) => {
        // Suponiendo que el backend devuelve el id de la nueva asignación creada
        const newAssignment = {
          id: res.data.data, // El ID de la asignación retornado por el backend
          beneficiario: beneficiarios.find(v => v.id === beneficiarioSeleccionado)?.name,
          programa: programas.find(p => p.id === programaSeleccionado)?.name,
          user_id: beneficiarioSeleccionado,
          program_id: programaSeleccionado
        };

        // Actualizamos el estado con la nueva asignación
        setAsignaciones([...asignaciones, newAssignment]);

        // Limpiar campos después de una asignación exitosa
        setBeneficiarioSeleccionado('');
        setProgramaSeleccionado('');
        setSuccessMessage('Asignacion realizada exitosamente.')
      })
      .catch(error => {
        if (error.response) {
          if (error.response.status === 409) {
            setMessage('El beneficiario ya está asignado a este programa.');
          } else {
            setMessage('Error al asignar beneficiario.');
          }
        } else {
          setMessage('Error del servidor. Inténtalo de nuevo.');
        }
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
  };

  const handleEditar = (asignacion) => {
    setBeneficiarioSeleccionado(asignacion.user_id);
    setProgramaSeleccionado(asignacion.program_id);
    setCurrentId(asignacion.id);
    setEditAsignacion(asignacion);
    setIsEditModalOpen(true);
  };

  const confirmEdit = () => {
    const datosEditados = {
      user_id: beneficiarioSeleccionado,
      program_id: programaSeleccionado
    };

    axios.put(`http://localhost:5000/asigBenProg/beneficiarios/${currentId}`, datosEditados)
      .then((res) => {
        const updatedData = res.data.updatedData;

        // Actualizamos la asignación en el estado con los datos retornados
        const updatedAsignaciones = asignaciones.map(asignacion =>
          asignacion.id === currentId ? {
            ...asignacion,
            beneficiario: beneficiarios.find(v => v.id === updatedData.user_id)?.name || asignacion.beneficiario,
            programa: programas.find(p => p.id === updatedData.program_id)?.name || asignacion.programa,
            user_id: updatedData.user_id,
            program_id: updatedData.program_id
          } : asignacion
        );

        setAsignaciones(updatedAsignaciones);

        // Limpiar los campos después de una edición exitosa
        setBeneficiarioSeleccionado('');
        setProgramaSeleccionado('');
        setIsEditModalOpen(false); // Cerramos el modal de edición
        setSuccessMessage('Asignacion actualizada exitosamente.')
      })
      .catch(error => {
        if (error.response) {
          if (error.response.status === 409) {
            setMessage('El beneficiario ya está asignado a este programa.');
          } else {
            setMessage('Error al actualizar la asignación.');
          }
        } else {
          setMessage('Error de red. Inténtalo de nuevo.');
        }

        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
  };

  const handleEliminar = (id) => {
    setIsDeleteConfirmOpen(true);
    setCurrentId(id);
  };

  const confirmDelete = () => {
    axios.delete(`http://localhost:5000/asigBenProg/beneficiarios/${currentId}`)
      .then(() => {
        setAsignaciones(asignaciones.filter(asignacion => asignacion.id !== currentId));
        setIsDeleteConfirmOpen(false);
        setCurrentId(null);
        setSuccessMessage('Asignacion eliminada exitosamente.')
      })
      .catch(err => console.error('Error deleting assignment:', err));
  };

  const buttonVariants = {
    hover: { scale: 1.1, transition: { duration: 0.3 } },
    tap: { scale: 0.9, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto mt-2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Botón de cerrar sesión */}
    <button
        onClick={handleLogout}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#ff0000', // Rojo brillante
          color: 'white',
          border: 'none',
          padding: '10px 15px',
          borderRadius: '5px',
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
          zIndex: 9999,
        }}
      >
        Cerrar sesión
      </button>
      {/* Título "Asignación" */}
      <Typography variant="h3" align="center" color='primary' gutterBottom>
        Asignación
      </Typography>
      <Card
        sx={{
          backgroundColor: '#383D3B', // Fondo principal oscuro
          color: '#EEE5E9', // Texto claro
          padding: '20px',
          borderRadius: '15px',
        }}
      >
        <CardContent>
          <Typography variant="h4" align="center" color="#EEE5E9" gutterBottom>
            Asignar Beneficiario a Programa
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                sx={{
                  backgroundColor: '#7C7C7C', // Fondo de los selects
                  borderRadius: '5px',
                }}
              >
                <InputLabel id="beneficiario-label" sx={{ color: '#EEE5E9' }}>
                  Selecciona un Beneficiario
                </InputLabel>
                <Select
                  labelId="beneficiario-label"
                  value={beneficiarioSeleccionado}
                  onChange={(e) => setBeneficiarioSeleccionado(e.target.value)}
                  label="Selecciona un Beneficiario"
                  sx={{
                    '.MuiSelect-select': {
                      color: beneficiarioSeleccionado ? '#EEE5E9' : '#7C7C7C', // Texto en selects
                    },
                  }}
                >
                  {beneficiarios.map((beneficiario) => (
                    <MenuItem key={beneficiario.id} value={beneficiario.id}>
                      {beneficiario.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                sx={{
                  backgroundColor: '#7C7C7C', // Fondo de selects
                  borderRadius: '5px',
                }}
              >
                <InputLabel id="programa-label" sx={{ color: '#EEE5E9' }}>
                  Selecciona un Programa
                </InputLabel>
                <Select
                  labelId="programa-label"
                  value={programaSeleccionado}
                  onChange={(e) => setProgramaSeleccionado(e.target.value)}
                  label="Selecciona un Programa"
                  sx={{
                    '.MuiSelect-select': {
                      color: programaSeleccionado ? '#EEE5E9' : '#7C7C7C', // Texto
                    },
                  }}
                >
                  {programas.map((programa) => (
                    <MenuItem key={programa.id} value={programa.id}>
                      {programa.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <div className="mt-6 flex justify-end">
            <motion.button
              className="bg-[#0097A7] text-[#EEE5E9] px-4 py-2 rounded-full" // Botón de asignación
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAsignar}
            >
              <FaPlus />
            </motion.button>
          </div>
          {/* Tabla */}
          <TableContainer
            component={Paper}
            sx={{
              marginTop: '20px',
              backgroundColor: '#383D3B', // Fondo oscuro
            }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: '#7C7C7C' }}> {/* Encabezados */}
                <TableRow>
                  <TableCell sx={{ color: '#EEE5E9' }}>Beneficiario</TableCell>
                  <TableCell sx={{ color: '#EEE5E9' }}>Programa</TableCell>
                  <TableCell sx={{ color: '#EEE5E9' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asignaciones.map((asignacion) => (
                  <TableRow key={asignacion.id} style={{ borderBottom: '1px solid #7C7C7C' }}>
                    <TableCell sx={{ color: '#EEE5E9' }}>{asignacion.beneficiario}</TableCell>
                    <TableCell sx={{ color: '#EEE5E9' }}>{asignacion.programa}</TableCell>
                    <TableCell sx={{ color: '#EEE5E9' }}>
                      <motion.button
                        className="bg-[#0097A7] text-[#EEE5E9] px-2 py-1 rounded-full" // Botón de editar
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditar(asignacion)}
                      >
                        <FaEdit />
                      </motion.button>
                      <motion.button
                        className="bg-red-500 text-white px-2 py-1 rounded-full ml-2" // Botón de eliminar
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEliminar(asignacion.id)}
                      >
                        <FaTrashAlt />
                      </motion.button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Formulario de Edición */}
      <AnimatePresence>
        {isEditModalOpen && editAsignacion && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="p-8 rounded-xl shadow-lg max-w-lg w-full"
              style={{
                backgroundColor: '#383D3B', // Fondo oscuro
                color: '#EEE5E9', // Texto claro
              }}
              initial={{ y: '-100vh' }}
              animate={{ y: '0' }}
              exit={{ y: '-100vh' }}
            >
              <Typography variant="h5" gutterBottom>
                Editar Asignación
              </Typography>
              <FormControl fullWidth sx={{ marginBottom: '16px', backgroundColor: '#7C7C7C', borderRadius: '5px' }}>
                <InputLabel id="edit-beneficiario-label" sx={{ color: '#EEE5E9' }}>
                  Selecciona un Beneficiario
                </InputLabel>
                <Select
                  labelId="edit-beneficiario-label"
                  value={beneficiarioSeleccionado}
                  onChange={(e) => setBeneficiarioSeleccionado(e.target.value)}
                  sx={{ '.MuiSelect-select': { color: '#EEE5E9' } }}
                >
                  {beneficiarios.map((beneficiario) => (
                    <MenuItem key={beneficiario.id} value={beneficiario.id}>
                      {beneficiario.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ marginBottom: '16px', backgroundColor: '#7C7C7C', borderRadius: '5px' }}>
                <InputLabel id="edit-programa-label" sx={{ color: '#EEE5E9' }}>
                  Selecciona un Programa
                </InputLabel>
                <Select
                  labelId="edit-programa-label"
                  value={programaSeleccionado}
                  onChange={(e) => setProgramaSeleccionado(e.target.value)}
                  sx={{ '.MuiSelect-select': { color: '#EEE5E9' } }}
                >
                  {programas.map((programa) => (
                    <MenuItem key={programa.id} value={programa.id}>
                      {programa.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div className="flex justify-between">
                <motion.button
                  className="bg-[#0097A7] text-[#EEE5E9] px-4 py-2 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={confirmEdit}
                >
                  Guardar Cambios
                </motion.button>
                <motion.button
                  className="bg-red-500 text-white px-4 py-2 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cerrar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Confirmación de eliminar */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: '#383D3B', // Fondo oscuro
            color: '#EEE5E9', // Texto claro
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">{"¿Estás seguro de eliminar esta asignación?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: '#EEE5E9' }}>
            Esta acción no se puede deshacer. ¿Deseas continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <motion.button
            className="bg-[#7C7C7C] text-[#EEE5E9] px-4 py-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDeleteConfirmOpen(false)}
          >
            Cancelar
          </motion.button>
          <motion.button
            className="bg-red-500 text-white px-4 py-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={confirmDelete}
          >
            Eliminar
          </motion.button>
        </DialogActions>
      </Dialog>
      {/* Snackbar para errores */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
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
            transition={{ duration: 0.2, ease: "easeIn" }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="p-6 rounded-xl shadow-lg"
              style={{
                backgroundColor: '#003f5c', // Fondo azul oscuro
                color: '#ffffff', // Texto blanco puro
              }}
            >
              <h2
                style={{
                  color: '#ffffff', // Texto blanco puro
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                {successMessage}
              </h2>
              <div className="flex justify-center items-center">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={checkmarkVariants}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="flex justify-center items-center"
                  style={{
                    borderRadius: '50%', // Hace que sea un círculo
                    backgroundColor: '#0097A7', // Aqua oscuro
                    width: '80px', // Tamaño del círculo
                    height: '80px', // Tamaño del círculo
                    display: 'flex', // Para alinear el contenido
                    justifyContent: 'center', // Centra horizontalmente
                    alignItems: 'center', // Centra verticalmente
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra suave
                  }}
                >
                  <FaCheck size={50} style={{ color: '#ffffff' }} /> {/* Palomita blanca */}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AsignacionesBen_Pro;
