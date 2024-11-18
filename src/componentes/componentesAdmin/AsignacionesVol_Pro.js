import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrashAlt, FaEdit, FaCheck } from 'react-icons/fa';

const AsignacionesVol_Pro = () => {
  const [voluntarioSeleccionado, setVoluntarioSeleccionado] = useState('');
  const [programaSeleccionado, setProgramaSeleccionado] = useState('');
  const [taskStatusSeleccionado, setTaskStatusSeleccionado] = useState('active');
  const [asignaciones, setAsignaciones] = useState([]);
  const [voluntarios, setVoluntarios] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [editAsignacion, setEditAsignacion] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [message, setMessage] = useState('');
  const [errorVoluntario, setErrorVoluntario] = useState('');
  const [errorPrograma, setErrorPrograma] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito
  const [loading, setLoading] = useState(true);
  const [atBottom, setAtBottom] = useState(true);
  const userListRef = useRef(null);

  const handleScroll = () => {
    const userListContainer = userListRef.current;
    if (userListContainer) {
      setAtBottom(userListContainer.scrollHeight - userListContainer.scrollTop === userListContainer.clientHeight);
    }
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

  // Cargar los voluntarios y programas al montar el componente
  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }

    axios.get('http://localhost:5000/asigVolProg/voluntarios')
      .then(res => {
        setVoluntarios(res.data);
      })
      .catch(err => console.error('Error fetching volunteers:', err),
        setLoading(false));

    axios.get('http://localhost:5000/asigVolProg/programas')
      .then(res => {
        setProgramas(res.data);
      })
      .catch(err => console.error('Error fetching programs:', err),
        setLoading(false));

    axios.get('http://localhost:5000/asigVolProg/asignaciones')
      .then(res => {
        setAsignaciones(res.data);
      })
      .catch(err => console.error('Error fetching assignments:', err),
        setLoading(false));
  }, []);

  //Alerta se cierra automaticamente despues de 5 segundos
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        setSuccessMessage('');
      }, 1000); // definir en cuanto tiempo desaparecera la alerta, se mide en ms (3 segundos)

    }
  }, [successMessage]);

  // Manejar la asignación de voluntarios a programas
  const handleAsignar = () => {
    // Validar si los campos están vacíos
    if (!voluntarioSeleccionado) {
      setErrorVoluntario(true);
      setMessage('Debes seleccionar un voluntario.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    if (!programaSeleccionado) {
      setErrorPrograma(true);
      setMessage('Debes seleccionar un programa.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
  
    const nuevaAsignacion = {
      user_id: voluntarioSeleccionado,
      program_id: programaSeleccionado,
      task_status: taskStatusSeleccionado,
      coordinator_id: 1, // Este valor puede depender de tu lógica
    };
  
    axios
      .post('http://localhost:5000/asigVolProg/voluntarios', nuevaAsignacion)
      .then((res) => {
        const newAssignment = {
          ...nuevaAsignacion,
          id: res.data.data,
          voluntario: voluntarios.find((v) => v.id === voluntarioSeleccionado)?.name,
          programa: programas.find((p) => p.id === programaSeleccionado)?.name,
        };
        setAsignaciones([...asignaciones, newAssignment]);
        setVoluntarioSeleccionado('');
        setProgramaSeleccionado('');
        setTaskStatusSeleccionado('active');
        setSuccessMessage('Asignación realizada exitosamente.');
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.data.message === 'El voluntario ya está asignado a este programa.') {
            setMessage('El voluntario ya está asignado a este programa.');
          } else {
            setMessage('Error al asignar voluntario.');
          }
        } else {
          setMessage('Error al asignar voluntario. Por favor, inténtalo de nuevo.');
        }
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
  };
  
  const confirmEdit = () => {
    // Validar si los campos están vacíos
    if (!voluntarioSeleccionado) {
      setErrorVoluntario(true);
      setMessage('Debes seleccionar un voluntario.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    if (!programaSeleccionado) {
      setErrorPrograma(true);
      setMessage('Debes seleccionar un programa.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    if (!taskStatusSeleccionado) {
      setMessage('Debes seleccionar un estado.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
  
    const datosEditados = {
      user_id: voluntarioSeleccionado,
      program_id: programaSeleccionado,
      task_status: taskStatusSeleccionado,
    };
  
    axios
      .put(`http://localhost:5000/asigVolProg/voluntarios/${currentId}`, datosEditados)
      .then((res) => {
        const updatedData = res.data.updatedData;
  
        const updatedAsignaciones = asignaciones.map((asignacion) =>
          asignacion.id === currentId
            ? {
                ...asignacion,
                voluntario: voluntarios.find((v) => v.id === updatedData.user_id)?.name || asignacion.voluntario,
                programa: programas.find((p) => p.id === updatedData.program_id)?.name || asignacion.programa,
                task_status: updatedData.task_status,
                user_id: updatedData.user_id,
                program_id: updatedData.program_id,
              }
            : asignacion
        );
        setAsignaciones(updatedAsignaciones);
  
        setVoluntarioSeleccionado('');
        setProgramaSeleccionado('');
        setTaskStatusSeleccionado('');
        setIsEditModalOpen(false);
        setSuccessMessage('Asignación actualizada exitosamente.');
      })
      .catch((error) => {
        if (error.response) {
          if (error.response.status === 409) {
            setMessage(error.response.data.message);
          } else if (error.response.status === 500) {
            setMessage('Error al actualizar la asignación.');
          }
        } else {
          setMessage('Error al editar asignación. Por favor, inténtalo de nuevo.');
        }
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
  };  

  // Manejar la edición de una asignación
  const handleEditar = (asignacion) => {
    setVoluntarioSeleccionado(asignacion.user_id);
    setProgramaSeleccionado(asignacion.program_id);
    setTaskStatusSeleccionado(asignacion.task_status);
    setCurrentId(asignacion.id);
    setEditAsignacion(asignacion);
    setIsEditModalOpen(true);
  };

  // Manejar la eliminación de una asignación
  const handleEliminar = (id) => {
    setIsDeleteConfirmOpen(true);
    setCurrentId(id);
  };

  const confirmDelete = () => {
    axios.delete(`http://localhost:5000/asigVolProg/voluntarios/${currentId}`)
      .then(() => {
        setAsignaciones(asignaciones.filter(asignacion => asignacion.id !== currentId));
        setIsDeleteConfirmOpen(false);
        setCurrentId(null);
        setSuccessMessage('Asignacion eliminada exitosamente.')
      })
      .catch(err => {
        console.error('Error deleting assignment:', err);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
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
            Asignar Voluntario a Programa
          </Typography>
          {/* Formulario */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                sx={{
                  backgroundColor: '#7C7C7C', // Fondo de los selects
                  borderRadius: '5px',
                }}
              >
                <InputLabel id="voluntario-label" sx={{ color: '#EEE5E9' }}>
                  Selecciona un Voluntario
                </InputLabel>
                <Select
                  labelId="voluntario-label"
                  value={voluntarioSeleccionado}
                  onChange={(e) => setVoluntarioSeleccionado(e.target.value)}
                  label="Selecciona un Voluntario"
                  sx={{
                    '.MuiSelect-select': {
                      color: voluntarioSeleccionado ? '#EEE5E9' : '#7C7C7C', // Texto en selects
                    },
                  }}
                >
                  {voluntarios.map((voluntario) => (
                    <MenuItem key={voluntario.id} value={voluntario.id}>
                      {voluntario.name}
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
                  <TableCell sx={{ color: '#EEE5E9' }}>Estado</TableCell>
                  <TableCell sx={{ color: '#EEE5E9' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asignaciones.map((asignacion) => (
                  <TableRow key={asignacion.id} style={{ borderBottom: '1px solid #7C7C7C' }}>
                    <TableCell sx={{ color: '#EEE5E9' }}>{asignacion.voluntario}</TableCell>
                    <TableCell sx={{ color: '#EEE5E9' }}>{asignacion.programa}</TableCell>
                    <TableCell sx={{ color: '#EEE5E9' }}>
                      <span
                        className={`text-lg font-bold ${asignacion.task_status === 'active'
                            ? 'text-green-500'
                            : asignacion.task_status === 'pause'
                              ? 'text-yellow-500'
                              : 'text-red-500'
                          }`}
                      >
                        {asignacion.task_status === 'active'
                          ? 'Activo'
                          : asignacion.task_status === 'pause'
                            ? 'Pausado'
                            : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell sx={{ color: '#333333' }}>
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
      {/* Modal de edición */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="p-8 rounded-xl shadow-lg max-w-lg w-full"
              style={{
                backgroundColor: '#2F3438', // Fondo oscuro del modal
                color: '#ffffff', // Texto blanco
              }}
            >
              <Typography variant="h5" sx={{ marginBottom: '20px', textAlign: 'center' }}>
                Editar Asignación
              </Typography>

              {/* Selección de beneficiario */}
              <FormControl
                fullWidth
                sx={{ marginBottom: '10px', backgroundColor: '#4A4E53', borderRadius: '5px' }}
                error={!voluntarioSeleccionado && errorVoluntario}
              >
                <InputLabel sx={{ color: '#E2E2E2' }}>Selecciona un Beneficiario</InputLabel>
                <Select
                  value={voluntarioSeleccionado}
                  onChange={(e) => setVoluntarioSeleccionado(e.target.value)}
                  sx={{
                    '.MuiSelect-select': {
                      color: '#E2E2E2',
                    },
                  }}
                >
                  {voluntarios.map((voluntario) => (
                    <MenuItem key={voluntario.id} value={voluntario.id}>
                      {voluntario.name}
                    </MenuItem>
                  ))}
                </Select>
                {!voluntarioSeleccionado && errorVoluntario && (
                  <Typography variant="body2" sx={{ color: '#E63946' }}>
                    Este campo es obligatorio.
                  </Typography>
                )}
              </FormControl>

              {/* Selección de programa */}
              <FormControl
                fullWidth
                sx={{ marginBottom: '10px', backgroundColor: '#4A4E53', borderRadius: '5px' }}
                error={!programaSeleccionado && errorPrograma}
              >
                <InputLabel sx={{ color: '#E2E2E2' }}>Selecciona un Programa</InputLabel>
                <Select
                  value={programaSeleccionado}
                  onChange={(e) => setProgramaSeleccionado(e.target.value)}
                  sx={{
                    '.MuiSelect-select': {
                      color: '#E2E2E2',
                    },
                  }}
                >
                  {programas.map((programa) => (
                    <MenuItem key={programa.id} value={programa.id}>
                      {programa.name}
                    </MenuItem>
                  ))}
                </Select>
                {!programaSeleccionado && errorPrograma && (
                  <Typography variant="body2" sx={{ color: '#E63946' }}>
                    Este campo es obligatorio.
                  </Typography>
                )}
              </FormControl>

              {/* Selección de estado */}
              <FormControl
                fullWidth
                sx={{ backgroundColor: '#4A4E53', borderRadius: '5px' }}
              >
                <InputLabel sx={{ color: '#E2E2E2' }}>Selecciona el Estado</InputLabel>
                <Select
                  value={taskStatusSeleccionado}
                  onChange={(e) => setTaskStatusSeleccionado(e.target.value)}
                  sx={{
                    '.MuiSelect-select': {
                      color: '#E2E2E2',
                    },
                  }}
                >
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="pause">Pausado</MenuItem>
                  <MenuItem value="unactive">Inactivo</MenuItem>
                </Select>
              </FormControl>

              {/* Botones del modal */}
              <div className="flex justify-between mt-4">
                <motion.button
                  className="text-white px-4 py-2 rounded-full"
                  style={{ backgroundColor: '#0097A7' }} // Azul aqua para "Guardar Cambios"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    confirmEdit();
                  }}
                >
                  Guardar Cambios
                </motion.button>
                <motion.button
                  className="text-white px-4 py-2 rounded-full"
                  style={{ backgroundColor: '#E63946' }} // Rojo para "Cerrar"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setIsEditModalOpen(false);
                  }}
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

export default AsignacionesVol_Pro;
