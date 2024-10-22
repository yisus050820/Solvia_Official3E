import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, Select, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrashAlt, FaPlus, FaCheck } from 'react-icons/fa';

const AsignacionesPresupuesto_Pro = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [dineroDisponible, setDineroDisponible] = useState(0);
  const [programaSeleccionado, setProgramaSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [errorCantidad, setErrorCantidad] = useState('');
  const [errorPrograma, setErrorPrograma] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditAsignacion, setCurrentEditAsignacion] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [editCantidad, setEditCantidad] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [message, setMessage] = useState('');

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const checkmarkVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: { opacity: 1, pathLength: 1 },
  };

  useEffect(() => {
    axios.get('http://localhost:5000/asigPresProg/asignaciones')
      .then(res => setAsignaciones(res.data))
      .catch(err => console.error('Error fetching assignments:', err));

    axios.get('http://localhost:5000/asigPresProg/programas')
      .then(res => setProgramas(res.data))
      .catch(err => console.error('Error fetching programs:', err));

    axios.get('http://localhost:5000/asigPresProg/disponible')
      .then(res => setDineroDisponible(res.data.dineroDisponible))
      .catch(err => console.error('Error fetching available funds:', err));
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timeoutId = setTimeout(() => {
        setSuccessMessage('');
      }, 1000);
  
      return () => clearTimeout(timeoutId);
    }
  }, [successMessage]);

  const handleAsignar = () => {
    let isValid = true;

    if (!programaSeleccionado) {
      setSnackbarSeverity('error');
      setMessage('Debes seleccionar un programa.');
      setOpenSnackbar(true);
      isValid = false;
    }

    if (!cantidad || cantidad <= 0) {
      setSnackbarSeverity('error');
      setMessage('La cantidad debe ser mayor que 0.');
      setOpenSnackbar(true);
      isValid = false;
    } else if (cantidad > dineroDisponible) {
      setSnackbarSeverity('error');
      setMessage('La cantidad no puede ser mayor que el dinero disponible.');
      setOpenSnackbar(true);
      isValid = false;
    }

    if (!isValid) return;

    const nuevaAsignacion = {
      program_id: programaSeleccionado,
      amount: cantidad,
      date: new Date().toISOString().split('T')[0],
    };

    axios.post('http://localhost:5000/asigPresProg/asignacion', nuevaAsignacion)
      .then(() => {
        Promise.all([
          axios.get('http://localhost:5000/asigPresProg/asignaciones'),
          axios.get('http://localhost:5000/asigPresProg/disponible')
        ])
          .then(([asignacionesRes, disponibleRes]) => {
            setAsignaciones(asignacionesRes.data);
            setDineroDisponible(disponibleRes.data.dineroDisponible);
          })
          .catch(err => console.error('Error fetching updated info:', err));

        setProgramaSeleccionado('');
        setCantidad('');
        setSuccessMessage('Asignación realizada exitosamente.');
      })
      .catch(err => {
        if (err.response) {
          if (err.response.status === 400) {
            setMessage('El programa ya tiene un presupuesto asignado.');
          } else {
            setMessage('Error al asignar presupueto.');
          }
        } else {
          setMessage('Error del servidor. Inténtalo de nuevo.');
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
    axios.delete(`http://localhost:5000/asigPresProg/asignacion/${currentId}`)
      .then(() => {
        setAsignaciones(asignaciones.filter(asignacion => asignacion.id !== currentId));
        setIsDeleteConfirmOpen(false);
        setSuccessMessage('Asignación eliminada exitosamente.');
      })
      .catch(err => {
        setSnackbarSeverity('error');
        setMessage('Error al eliminar la asignación.');
        setOpenSnackbar(true);
      });
  };

  const handleEditar = (asignacion) => {
    setCurrentEditAsignacion(asignacion);
    setEditCantidad(asignacion.presupuesto);
    setErrorCantidad('');
    setEditModalOpen(true);
  };

  const handleGuardarEdicion = () => {
    let isValid = true;
    setErrorCantidad('');

    if (!editCantidad || editCantidad <= 0) {
      setMessage('La cantidad debe ser mayor que 0.');
      isValid = false;
    } else if (editCantidad > dineroDisponible) {
      setMessage('La cantidad no puede ser mayor que el dinero disponible.');
      isValid = false;
    }

    setSnackbarSeverity('error');
    setOpenSnackbar(true);

    if (!isValid) return;

    const updatedAsignacion = {
      ...currentEditAsignacion,
      amount: editCantidad
    };

    axios.put(`http://localhost:5000/asigPresProg/asignacion/${currentEditAsignacion.id}`, updatedAsignacion)
      .then(() => {
        setAsignaciones(asignaciones.map(asignacion =>
          asignacion.id === currentEditAsignacion.id
            ? { ...asignacion, presupuesto: editCantidad }
            : asignacion
        ));
        setEditModalOpen(false);
        setSuccessMessage('Asignación actualizada exitosamente.');
      })
      .catch(err => {
        setSnackbarSeverity('error');
        setMessage('Error al editar la asignación.');
        setOpenSnackbar(true);
      });
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto mt-0"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Asignación
      </Typography>

      <Card sx={{ backgroundColor: '#1e293b', color: '#fff', padding: '20px', borderRadius: '15px' }}>
        <CardContent>
          <Typography variant="h4" color="white" gutterBottom>
            Asignar Presupuesto a Programas
          </Typography>
          <Typography variant="h6" color="white">
            Dinero Disponible: ${dineroDisponible ? dineroDisponible.toLocaleString() : 'Cargando...'}
          </Typography>

          <Grid container spacing={4} sx={{ marginTop: '20px' }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ backgroundColor: '#fff', borderRadius: '5px' }}>
                <InputLabel id="programa-label" sx={{ color: 'black' }}>Selecciona un Programa</InputLabel>
                <Select
                  labelId="programa-label"
                  value={programaSeleccionado}
                  onChange={(e) => setProgramaSeleccionado(e.target.value)}
                  label="Selecciona un Programa"
                  sx={{
                    '.MuiSelect-select': {
                      color: programaSeleccionado ? 'black' : 'inherit',
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 5 + 8,
                        width: 250,
                      }
                    }
                  }}
                >
                  {programas.map(programa => (
                    <MenuItem key={programa.id} value={programa.id}>
                      {programa.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Cantidad"
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                fullWidth
                sx={{ backgroundColor: '#fff', borderRadius: '5px' }}
                InputLabelProps={{
                  style: { color: 'black' },
                }}
                inputProps={{
                  style: { color: 'black' },
                }}
              />
            </Grid>
          </Grid>

          <div className="mt-6 flex justify-end">
            <motion.button className="bg-green-500 text-white px-4 py-2 rounded-full" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleAsignar}>
              <FaPlus /> 
            </motion.button>
          </div>

          <TableContainer component={Paper} sx={{ marginTop: '20px', backgroundColor: '#2d3748' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#4a5568' }}>
                <TableRow>
                  <TableCell sx={{ color: '#fff' }}>Programa</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Presupuesto</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asignaciones.map(asignacion => (
                  <TableRow key={asignacion.id} style={{ borderBottom: '1px solid #4a5568' }}>
                    <TableCell sx={{ color: '#fff' }}>{asignacion.programa}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>${asignacion.presupuesto}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>
                      <motion.button className="bg-blue-500 text-white px-2 py-1 rounded-full" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEditar(asignacion)}>
                        <FaEdit />
                      </motion.button>
                      <motion.button className="bg-red-500 text-white px-2 py-1 rounded-full ml-2" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEliminar(asignacion.id)}>
                        <FaTrashAlt />
                      </motion.button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <AnimatePresence>
            {editModalOpen && (
              <motion.div 
                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="bg-gray-800 text-white p-8 rounded-xl shadow-lg max-w-lg w-full" 
                  initial={{ y: '-100vh' }} 
                  animate={{ y: '0' }} 
                  exit={{ y: '-100vh' }}
                >
                  <h2 className="text-2xl font-bold mb-4">Editar Asignación</h2>
                  <DialogContent className="space-y-4">
                    <TextField
                      label="Programa"
                      value={currentEditAsignacion?.programa || ''}
                      fullWidth
                      InputProps={{ style: { color: 'black' } }}
                      sx={{ backgroundColor: '#FFF', borderRadius: '5px' }}
                    />
                    <TextField
                      label="Cantidad"
                      type="number"
                      value={editCantidad}
                      onChange={(e) => setEditCantidad(Number(e.target.value))}
                      fullWidth
                      InputLabelProps={{ style: { color: 'white' } }}
                      inputProps={{ style: { color: 'white' } }}
                      sx={{ backgroundColor: '#2D3748', borderRadius: '5px' }}
                    />
                  </DialogContent>
                  <div className="flex justify-between mt-4"> 
                  <motion.button 
                      className="bg-blue-500 text-white px-4 py-2 rounded" 
                      whileHover={{ backgroundColor: '#4A90E2', scale: 1.1 }} 
                      whileTap={{ scale: 0.9 }}
                      onClick={handleGuardarEdicion}
                    >
                      Guardar
                    </motion.button>
                    <motion.button 
                      className="bg-gray-500 text-white px-4 py-2 rounded" 
                      whileHover={{ backgroundColor: '#636363', scale: 1.1 }} 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditModalOpen(false)}
                    >
                      Cerrar
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <Dialog open={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">{"¿Estás seguro de eliminar esta asignación?"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">Esta acción no se puede deshacer. ¿Deseas continuar?</DialogContentText>
            </DialogContent>
            <DialogActions>
              <motion.button 
                className="bg-gray-500 text-white px-4 py-2 rounded-full" 
                whileHover={{ scale: 1.1 }}
                whileTap={{scale: 0.9}}
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancelar
              </motion.button>
              <motion.button 
                className="bg-red-500 text-white px-4 py-2 rounded-full" 
                whileHover={{ scale: 1.1 }} 
                whileTap={{scale: 0.9}}
                onClick={confirmDelete}
              >
                Eliminar
              </motion.button>
            </DialogActions>
          </Dialog>

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
                  className="bg-gray-800 p-6 rounded-xl shadow-lg"
                >
                  <h2 className="text-white text-2xl font-bold mb-4">{successMessage}</h2>
                  <div className='flex justify-center items-center'>
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={checkmarkVariants}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className='flex justify-center items-center'
                      style={{
                        borderRadius: '50%',
                        backgroundColor: '#4CAF50',
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <FaCheck size={50} className="text-white"/>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
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
    </motion.div>
  );
};

export default AsignacionesPresupuesto_Pro;
