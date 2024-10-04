import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, MenuItem, Select, FormControl, InputLabel, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
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
  const [editModalOpen, setEditModalOpen] = useState(false); // Modal para editar
  const [currentEditAsignacion, setCurrentEditAsignacion] = useState(null); // Asignación a editar
  const [editCantidad, setEditCantidad] = useState(''); // Cantidad a editar

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
    setErrorCantidad('');
    setErrorPrograma('');

    // Validaciones
    if (!programaSeleccionado) {
      setErrorPrograma('Debes seleccionar un programa.');
      isValid = false;
    }

    if (!cantidad || cantidad <= 0) {
      setErrorCantidad('La cantidad debe ser mayor que 0.');
      isValid = false;
    } else if (cantidad > dineroDisponible) {
      setErrorCantidad('La cantidad no puede ser mayor que el dinero disponible.');
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
        if (err.response && err.response.status === 400) {
          setErrorPrograma(err.response.data.message);
        } else {
          console.error('Error assigning budget:', err);
        }
      });
  };

  const handleEliminar = (id) => {
    axios.delete(`http://localhost:5000/asigPresProg/asignacion/${id}`)
      .then(() => {
        setAsignaciones(asignaciones.filter(asignacion => asignacion.id !== id));
      })
      .catch(err => console.error('Error deleting assignment:', err));
  };

  const handleEditar = (asignacion) => {
    setCurrentEditAsignacion(asignacion); // Asignación seleccionada para editar
    setEditCantidad(asignacion.presupuesto); // Cantidad inicial a editar
    setErrorCantidad('');  // Limpiar cualquier error anterior
    setEditModalOpen(true); // Abrir el modal de edición
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
        // Actualiza las asignaciones localmente sin refrescar la página
        setAsignaciones(asignaciones.map(asignacion =>
          asignacion.id === currentEditAsignacion.id
            ? { ...asignacion, presupuesto: editCantidad } // Actualiza solo la cantidad
            : asignacion
        ));
        setEditModalOpen(false);
      })
      .catch(err => console.error('Error editing assignment:', err));
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto mt-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
                <InputLabel id="programa-label" sx={{ color: 'gray' }}>Selecciona un Programa</InputLabel>
                <Select
                  labelId="programa-label"
                  value={programaSeleccionado}
                  onChange={(e) => setProgramaSeleccionado(e.target.value)}
                  label="Selecciona un Programa"
                  sx={{ backgroundColor: 'black', borderRadius: '5px' }}
                >
                  {programas.map(programa => (
                    <MenuItem key={programa.id} value={programa.id}>
                      {programa.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errorPrograma && <span style={{ color: 'red' }}>{errorPrograma}</span>}
            </Grid>

            <Grid item xs={12} md={6}>
            <TextField
              label="Cantidad"
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              fullWidth
            />
              {errorCantidad && <span style={{ color: 'red' }}>{errorCantidad}</span>}
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
                sx={{ marginBottom: '16px' }}
                disabled
              />
              <TextField
                label="Cantidad"
                type="number"
                value={editCantidad}
                onChange={(e) => setEditCantidad(Number(e.target.value))}
                fullWidth
              />
              {errorCantidad && <span style={{ color: 'red' }}>{errorCantidad}</span>}
              </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditModalOpen(false)} color="primary">
                Cancelar
              </Button>
              <Button onClick={handleGuardarEdicion} color="primary">
                Guardar
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AsignacionesPresupuesto_Pro;
