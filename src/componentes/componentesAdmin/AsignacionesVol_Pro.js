import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrashAlt, FaEdit } from 'react-icons/fa';

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

  // Cargar los voluntarios y programas al montar el componente
  useEffect(() => {
    axios.get('http://localhost:5000/asigVolProg/voluntarios')
      .then(res => {
        setVoluntarios(res.data);
      })
      .catch(err => console.error('Error fetching volunteers:', err));
  
    axios.get('http://localhost:5000/asigVolProg/programas')
      .then(res => {
        setProgramas(res.data);
      })
      .catch(err => console.error('Error fetching programs:', err));
  
    axios.get('http://localhost:5000/asigVolProg/asignaciones')
      .then(res => {
        setAsignaciones(res.data);
      })
      .catch(err => console.error('Error fetching assignments:', err));
  }, []);

  // Manejar la asignación de voluntarios a programas
  const handleAsignar = () => {
    if (!voluntarioSeleccionado || !programaSeleccionado) {
      console.error('Error: Campos incompletos.');
      return;
    }
  
    const nuevaAsignacion = {
      user_id: voluntarioSeleccionado,
      program_id: programaSeleccionado,
      task_status: taskStatusSeleccionado,
      coordinator_id: 1 
    };
  
    axios.post('http://localhost:5000/asigVolProg/voluntarios', nuevaAsignacion)
      .then(res => {
        const newAssignment = {
          ...nuevaAsignacion,
          id: res.data.data, 
          voluntario: voluntarios.find(v => v.id === voluntarioSeleccionado)?.name,
          programa: programas.find(p => p.id === programaSeleccionado)?.name
        };
        setAsignaciones([...asignaciones, newAssignment]); 
        setVoluntarioSeleccionado(''); 
        setProgramaSeleccionado(''); 
        setTaskStatusSeleccionado('active');
      })
      .catch(err => {
        console.error('Error assigning volunteer:', err);
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

  // Confirmar la edición
  const confirmEdit = () => {
    const datosEditados = {
      user_id: voluntarioSeleccionado,
      program_id: programaSeleccionado,
      task_status: taskStatusSeleccionado,
      coordinator_id: 1 
    };

    axios.put(`http://localhost:5000/asigVolProg/voluntarios/${currentId}`, datosEditados)
      .then(() => {
        const nuevasAsignaciones = asignaciones.map(asignacion => 
          asignacion.id === currentId ? { ...asignacion, ...datosEditados } : asignacion
        );
        setAsignaciones(nuevasAsignaciones);
        setIsEditModalOpen(false);
        setVoluntarioSeleccionado(''); 
        setProgramaSeleccionado('');
        setTaskStatusSeleccionado('active');
      })
      .catch(err => console.error('Error updating assignment:', err));
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
      })
      .catch(err => console.error('Error deleting assignment:', err));
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <motion.div className="max-w-6xl mx-auto mt-2" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Título "Asignación" */}
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Asignación
      </Typography>
      <Card sx={{ backgroundColor: '#1e293b', color: '#fff', padding: '20px', borderRadius: '15px' }}>
        <CardContent>
          <Typography variant="h4" color="white" gutterBottom>Asignar Voluntario a Programa</Typography>
          {/* Formulario para asignar voluntario a programa */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ backgroundColor: '#fff', borderRadius: '5px' }}>
                <InputLabel id="voluntario-label" sx={{ color: 'black' }}>Selecciona un Voluntario</InputLabel>
                <Select
                  labelId="voluntario-label"
                  value={voluntarioSeleccionado}
                  onChange={(e) => setVoluntarioSeleccionado(e.target.value)}
                  label="Selecciona un Voluntario"
                  sx={{
                    '.MuiSelect-select': {
                      color: voluntarioSeleccionado ? 'black' : 'inherit',
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
                  {voluntarios.map((voluntario) => (
                    <MenuItem key={voluntario.id} value={voluntario.id}>
                      {voluntario.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
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
            <motion.button className="bg-green-500 text-white px-4 py-2 rounded-full" variants={buttonVariants} whileHover="hover" whileTap="tap" onClick={handleAsignar}>
              <FaPlus />
            </motion.button>
          </div>

          {/* Tabla de Asignaciones */}
          <TableContainer component={Paper} sx={{ marginTop: '20px', backgroundColor: '#2d3748' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#4a5568' }}>
                <TableRow>
                  <TableCell sx={{ color: '#fff' }}>Voluntario</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Programa</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Estado</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asignaciones.map((asignacion) => (
                  <TableRow key={asignacion.id} style={{ borderBottom: '1px solid #4a5568' }}>
                    <TableCell sx={{ color: '#fff' }}>{asignacion.voluntario}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{asignacion.programa}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>
                      <span className={`text-lg font-bold ${asignacion.task_status === 'active' ? 'text-green-500' : asignacion.task_status === 'pause' ? 'text-yellow-500' : 'text-red-500'}`}>
                        {asignacion.task_status === 'active' ? 'Activo' : asignacion.task_status === 'pause' ? 'Pausado' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell sx={{ color: '#fff' }}>
                      <motion.button className="bg-blue-500 text-white px-2 py-1 rounded-full" variants={buttonVariants} whileHover="hover" whileTap="tap" onClick={() => handleEditar(asignacion)}>
                        <FaEdit />
                      </motion.button>
                      <motion.button className="bg-red-500 text-white px-2 py-1 rounded-full ml-2" variants={buttonVariants} whileHover="hover" whileTap="tap" onClick={() => handleEliminar(asignacion.id)}>
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
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-gray-800 text-white p-8 rounded-xl shadow-lg max-w-lg w-full" initial={{ y: '-100vh' }} animate={{ y: '0' }} exit={{ y: '-100vh' }}>
              <h2 className="text-2xl font-bold mb-4">Editar Asignación</h2>
              <div className="space-y-4">
                <select className="w-full p-2 border border-gray-500 rounded bg-gray-900 text-white" value={voluntarioSeleccionado} onChange={(e) => setVoluntarioSeleccionado(e.target.value)}>
                  <option value="">Selecciona un voluntario</option>
                  {voluntarios.map((voluntario) => (
                    <option key={voluntario.id} value={voluntario.id}>
                      {voluntario.name}
                    </option>
                  ))}
                </select>

                <select className="w-full p-2 border border-gray-500 rounded bg-gray-900 text-white" value={programaSeleccionado} onChange={(e) => setProgramaSeleccionado(e.target.value)}>
                  <option value="">Selecciona un programa</option>
                  {programas.map((programa) => (
                    <option key={programa.id} value={programa.id}>
                      {programa.name}
                    </option>
                  ))}
                </select>

                <select className="w-full p-2 border border-gray-500 rounded bg-gray-900 text-white" value={taskStatusSeleccionado} onChange={(e) => setTaskStatusSeleccionado(e.target.value)}>
                  <option value="active">Activo</option>
                  <option value="pause">Pausado</option>
                  <option value="unactive">Inactivo</option>
                </select>
              </div>
              <div className="flex justify-between mt-4">
                <motion.button className="bg-blue-500 text-white px-4 py-2 rounded" whileHover={{ backgroundColor: '#4A90E2' }} onClick={confirmEdit}>
                  Guardar Cambios
                </motion.button>
                <motion.button className="bg-gray-500 text-white px-4 py-2 rounded" whileHover={{ backgroundColor: '#636363' }} onClick={() => setIsEditModalOpen(false)}>
                  Cerrar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmación de eliminar */}
      <Dialog open={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"¿Estás seguro de eliminar esta asignación?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Esta acción no se puede deshacer. ¿Deseas continuar?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <motion.button className="bg-gray-500 text-white px-4 py-2 rounded-full" whileHover={{ scale: 1.1 }} onClick={() => setIsDeleteConfirmOpen(false)}>
            Cancelar
          </motion.button>
          <motion.button className="bg-red-500 text-white px-4 py-2 rounded-full" whileHover={{ scale: 1.1 }} onClick={confirmDelete}>
            Eliminar
          </motion.button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default AsignacionesVol_Pro;
