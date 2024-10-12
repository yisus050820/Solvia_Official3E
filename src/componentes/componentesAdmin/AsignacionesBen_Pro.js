import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrashAlt, FaEdit } from 'react-icons/fa';

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

  useEffect(() => {
    axios.get('http://localhost:5000/asigBenProg/beneficiarios')
      .then(res => {
        setBeneficiarios(res.data);
      })
      .catch(err => console.error('Error fetching beneficiaries:', err));
  
    axios.get('http://localhost:5000/asigBenProg/programas')
      .then(res => {
        setProgramas(res.data);
      })
      .catch(err => console.error('Error fetching programs:', err));
  
    axios.get('http://localhost:5000/asigBenProg/asignaciones')
      .then(res => {
        setAsignaciones(res.data);
      })
      .catch(err => console.error('Error fetching assignments:', err));
  }, [asignaciones]);  

  const handleAsignar = () => {
    if (!beneficiarioSeleccionado || !programaSeleccionado) {
      console.error('Error: Campos incompletos.');
      return;
    }
  
    const nuevaAsignacion = {
      user_id: beneficiarioSeleccionado,
      program_id: programaSeleccionado,
      coordinator_id: 1 
    };
  
    axios.post('http://localhost:5000/asigBenProg/beneficiarios', nuevaAsignacion)
      .then(res => {
        const newAssignment = {
          ...nuevaAsignacion,
          id: res.data.data, 
          beneficiario: beneficiarios.find(v => v.id === beneficiarioSeleccionado)?.name,
          programa: programas.find(p => p.id === programaSeleccionado)?.name
        };
        setAsignaciones([...asignaciones, newAssignment]); 
        setBeneficiarioSeleccionado('');
        setProgramaSeleccionado(''); 
      })
      .catch(err => {
        console.error('Error assigning volunteer:', err);
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
      .then(() => {
        const nuevasAsignaciones = asignaciones.map(asignacion =>
          asignacion.id === currentId
            ? {
                ...asignacion,
                ...datosEditados,
                beneficiario: beneficiarios.find(v => v.id === beneficiarioSeleccionado)?.name,
                programa: programas.find(p => p.id === programaSeleccionado)?.name
              }
            : asignacion
        );
  
        setAsignaciones(nuevasAsignaciones);
        setIsEditModalOpen(false);
        setBeneficiarioSeleccionado('');
        setProgramaSeleccionado('');
      })
      .catch(err => console.error('Error updating assignment:', err));
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
      })
      .catch(err => console.error('Error deleting assignment:', err));
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto mt-2"
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
            Asignar Beneficiario a Programa
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ backgroundColor: '#fff', borderRadius: '5px' }}>
                <InputLabel id="beneficiario-label" sx={{ color: 'black' }}>Selecciona un Beneficiario</InputLabel>
                <Select
                  labelId="beneficiario-label"
                  value={beneficiarioSeleccionado}
                  onChange={(e) => setBeneficiarioSeleccionado(e.target.value)}
                  label="Selecciona un Beneficiario"
                  sx={{
                    '.MuiSelect-select': {
                      color: beneficiarioSeleccionado ? 'black' : 'inherit',
                    }
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
            className="bg-green-500 text-white px-4 py-2 rounded-full" 
            variants={buttonVariants} 
            whileHover={{ scale: 1.1 }}
            whileTap={{scale: 0.9}}
            onClick={handleAsignar}>
              <FaPlus />
            </motion.button>
          </div>

          {/* Tabla de Asignaciones */}
          <TableContainer component={Paper} sx={{ marginTop: '20px', backgroundColor: '#2d3748' }}>
          <Table>
              <TableHead sx={{ backgroundColor: '#4a5568' }}>
                <TableRow>
                  <TableCell sx={{ color: '#fff' }}>Beneficiario</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Programa</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {asignaciones.map((asignacion) => (
                  <TableRow key={asignacion.id} style={{ borderBottom: '1px solid #4a5568' }}>
                    <TableCell sx={{ color: '#fff' }}>{asignacion.beneficiario}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{asignacion.programa}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>
                      <motion.button 
                      className="bg-blue-500 text-white px-2 py-1 rounded-full" 
                      variants={buttonVariants} 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{scale: 0.9}}
                      onClick={() => handleEditar(asignacion)}
                      >
                        <FaEdit />
                      </motion.button>
                      <motion.button 
                      className="bg-red-500 text-white px-2 py-1 rounded-full ml-2" 
                      variants={buttonVariants} 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{scale: 0.9}}
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
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-gray-800 text-white p-8 rounded-xl shadow-lg max-w-lg w-full" initial={{ y: '-100vh' }} animate={{ y: '0' }} exit={{ y: '-100vh' }}>
              <h2 className="text-2xl font-bold mb-4">Editar Asignación</h2>
              <div className="space-y-4">
                <select className="w-full p-2 border border-gray-500 rounded bg-gray-900 text-white" value={beneficiarioSeleccionado} onChange={(e) => setBeneficiarioSeleccionado(e.target.value)}>
                  <option value="">Selecciona un beneficiario</option>
                  {beneficiarios.map((beneficiario) => (
                    <option key={beneficiario.id} value={beneficiario.id}>
                      {beneficiario.name}
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
              </div>
              <div className="flex justify-between mt-4"> 
                <motion.button 
                className="bg-blue-500 text-white px-4 py-2 rounded" 
                whileHover={{ backgroundColor: '#4A90E2', scale: 1.1 }}
                whileTap={{scale: 0.9}}
                onClick={confirmEdit}>
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

export default AsignacionesBen_Pro;
