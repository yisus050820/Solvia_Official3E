import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, Select, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';

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
  const [editCantidad, setEditCantidad] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [message, setMessage] = useState('');

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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

  console.log(dineroDisponible);

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
      date: new Date().toISOString().split('T')[0]
    };

    axios.post('http://localhost:5000/asigPresProg/asignacion', nuevaAsignacion)
      .then(() => {
        axios.all([
          axios.get('http://localhost:5000/asigPresProg/asignaciones'),
          axios.get('http://localhost:5000/asigPresProg/disponible')
        ])
          .then(axios.spread((asignacionesRes, disponibleRes) => {
            setAsignaciones(asignacionesRes.data);
            setDineroDisponible(disponibleRes.data.dineroDisponible);
          }))
          .catch(err => console.error('Error fetching updated info:', err));

        setProgramaSeleccionado('');
        setCantidad('');
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
    axios.delete(`http://localhost:5000/asigPresProg/asignacion/${id}`)
      .then(() => {
        setAsignaciones(asignaciones.filter(asignacion => asignacion.id !== id));
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
      setErrorCantidad('La cantidad debe ser mayor que 0.');
      isValid = false;
    } else if (editCantidad > dineroDisponible) {
      setErrorCantidad('La cantidad no puede ser mayor que el dinero disponible.');
      isValid = false;
    }

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

      {/* Título "Asignación" */}
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

          {/* Formulario para asignar presupuesto */}
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
                  // Mismo color que el label de Selecciona un Programa
                  style: { color: 'black' },
                }}
                inputProps={{
                  style: { color: 'black' }, // Establece el color del texto ingresado a negro
                }}
              />
            </Grid>
          </Grid>

          <div className="mt-6 flex justify-end">
            <motion.button className="bg-green-500 text-white px-4 py-2 rounded-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAsignar}>
              <FaPlus />
            </motion.button>
          </div>

          {/* Tabla de asignaciones */}
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
                      <motion.button className="bg-blue-500 text-white px-2 py-1 rounded-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditar(asignacion)}>
                        <FaEdit />
                      </motion.button>
                      <motion.button className="bg-red-500 text-white px-2 py-1 rounded-full ml-2" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEliminar(asignacion.id)}>
                        <FaTrashAlt />
                      </motion.button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Modal de edición */}
          <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} aria-labelledby="edit-dialog-title">
            <DialogTitle id="edit-dialog-title">Editar Asignación</DialogTitle>
            <DialogContent>
              <TextField
                label="Programa"
                value={currentEditAsignacion?.programa || ''}
                fullWidth
                sx={{ marginBottom: '16px', backgroundColor: '#fff', borderRadius: '5px' }}
                InputProps={{
                  style: { color: 'black' }, // Establece el color del texto a negro
                }}
              />
              <TextField
                label="Cantidad"
                type="number"
                value={editCantidad}
                onChange={(e) => setEditCantidad(Number(e.target.value))}
                fullWidth
                sx={{ backgroundColor: '#fff', borderRadius: '5px' }}
                InputLabelProps={{
                  // Mismo color que el label de Selecciona un Programa
                  style: { color: 'black' },
                }}
                inputProps={{
                  style: { color: 'black' }, // Establece el color del texto ingresado a negro
                }}
              />
            </DialogContent>
            <DialogActions>
              <motion.button className="bg-red-500 text-white px-4 py-2 rounded-full" whileHover={{ scale: 1.05 }} onClick={() => setEditModalOpen(false)}>
                Cancelar
              </motion.button>
              <motion.button className="bg-blue-500 text-white px-4 py-2 rounded-full" whileHover={{ scale: 1.05 }} onClick={handleGuardarEdicion}>
                Guardar
              </motion.button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
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
  );
};

export default AsignacionesPresupuesto_Pro;
