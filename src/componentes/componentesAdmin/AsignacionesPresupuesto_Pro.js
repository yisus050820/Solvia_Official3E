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
  const [editModalOpen, setEditModalOpen] = useState(false);  // Para el modal de edición
  const [currentEditAsignacion, setCurrentEditAsignacion] = useState(null); // Almacena la asignación actual para editar
  const [editCantidad, setEditCantidad] = useState('');  // Almacena la cantidad editada

  useEffect(() => {
    // Obtener asignaciones
    axios.get('http://localhost:5000/asigPresProg/asignaciones')
      .then(res => setAsignaciones(res.data))
      .catch(err => console.error('Error fetching assignments:', err));

    // Obtener programas activos
    axios.get('http://localhost:5000/asigPresProg/programas')
      .then(res => setProgramas(res.data))
      .catch(err => console.error('Error fetching programs:', err));

    // Obtener dinero disponible
    axios.get('http://localhost:5000/asigPresProg/disponible')
      .then(res => setDineroDisponible(res.data.dineroDisponible))
      .catch(err => console.error('Error fetching available funds:', err));
  }, []);

  const handleAsignar = () => {
    if (!programaSeleccionado || !cantidad) {
      alert("Todos los campos son requeridos.");
      return;
    }

    const nuevaAsignacion = {
      program_id: programaSeleccionado,
      amount: cantidad
    };

    axios.post('http://localhost:5000/asigPresProg/asignacion', nuevaAsignacion)
      .then(res => {
        const newAssignment = {
          ...nuevaAsignacion,
          id: res.data.data,
          programa: programas.find(p => p.id === programaSeleccionado)?.name
        };
        setAsignaciones([...asignaciones, newAssignment]);
        setProgramaSeleccionado('');
        setCantidad('');
      })
      .catch(err => console.error('Error assigning budget:', err));
  };

  const handleEliminar = (id) => {
    axios.delete(`http://localhost:5000/asigPresProg/asignacion/${id}`)
      .then(() => {
        setAsignaciones(asignaciones.filter(asignacion => asignacion.id !== id));
      })
      .catch(err => console.error('Error deleting assignment:', err));
  };

  const handleEditar = (asignacion) => {
    setCurrentEditAsignacion(asignacion);  // Guarda la asignación seleccionada
    setEditCantidad(asignacion.presupuesto);  // Configura la cantidad a editar
    setEditModalOpen(true);  // Abre el modal de edición
  };

  const handleGuardarEdicion = () => {
    const updatedAsignacion = {
      ...currentEditAsignacion,
      amount: editCantidad
    };

    axios.put(`http://localhost:5000/asigPresProg/asignacion/${currentEditAsignacion.id}`, updatedAsignacion)
      .then(() => {
        // Actualiza la lista de asignaciones en el estado local sin necesidad de refrescar
        setAsignaciones(asignaciones.map(asignacion =>
          asignacion.id === currentEditAsignacion.id
            ? { ...asignacion, presupuesto: editCantidad }  // Actualizamos solo la cantidad
            : asignacion
        ));
        setEditModalOpen(false);  // Cierra el modal de edición
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
            Dinero Disponible: ${dineroDisponible.toLocaleString()}
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
                onChange={(e) => setCantidad(e.target.value)}
                fullWidth
                sx={{ backgroundColor: '#fff', borderRadius: '5px' }}
              />
            </Grid>
          </Grid>

          <div className="mt-6 flex justify-end">
            <motion.button className="bg-green-500 text-white px-4 py-2 rounded-full" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAsignar}>
              <FaPlus /> Asignar Presupuesto
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
                    <TableCell sx={{ color: '#fff' }}>${asignacion.presupuesto}</TableCell> {/* Usamos `presupuesto` para el campo amount */}
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
                onChange={(e) => setEditCantidad(e.target.value)}
                fullWidth
              />
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
