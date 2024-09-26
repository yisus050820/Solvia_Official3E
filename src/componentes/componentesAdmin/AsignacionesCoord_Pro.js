import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid, MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';

const AsignacionesCoord_Pro = () => {
  const [coordinadorSeleccionado, setCoordinadorSeleccionado] = useState('');
  const [programaSeleccionado, setProgramaSeleccionado] = useState('');
  const [asignaciones, setAsignaciones] = useState([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const coordinadores = [
    { id: 1, nombre: 'Juan García' },
    { id: 2, nombre: 'Laura Gómez' },
    { id: 3, nombre: 'Pedro Morales' },
  ];

  const programas = [
    { id: 1, nombre: 'Programa de Ayuda Alimentaria' },
    { id: 2, nombre: 'Programa de Educación' },
    { id: 3, nombre: 'Programa de Salud' },
  ];

  const handleAsignar = () => {
    if (coordinadorSeleccionado && programaSeleccionado) {
      const nuevaAsignacion = {
        id: asignaciones.length + 1,
        coordinador: coordinadores.find(c => c.id === coordinadorSeleccionado).nombre,
        programa: programas.find(p => p.id === programaSeleccionado).nombre,
      };
      setAsignaciones([...asignaciones, nuevaAsignacion]);
      setCoordinadorSeleccionado('');
      setProgramaSeleccionado('');
    }
  };

  const handleEliminar = (id) => {
    setIsDeleteConfirmOpen(true);
    setCurrentId(id);
  };

  const confirmDelete = () => {
    setAsignaciones(asignaciones.filter(asignacion => asignacion.id !== currentId));
    setIsDeleteConfirmOpen(false);
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95, transition: { duration: 0.2 } },
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
            Asignar Coordinador a Programa
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ backgroundColor: '#fff', borderRadius: '5px' }}>
                <InputLabel id="coordinador-label">Selecciona un Coordinador</InputLabel>
                <Select
                  labelId="coordinador-label"
                  value={coordinadorSeleccionado}
                  onChange={(e) => setCoordinadorSeleccionado(e.target.value)}
                  label="Selecciona un Coordinador"
                >
                  {coordinadores.map((coordinador) => (
                    <MenuItem key={coordinador.id} value={coordinador.id}>
                      {coordinador.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ backgroundColor: '#fff', borderRadius: '5px' }}>
                <InputLabel id="programa-label">Selecciona un Programa</InputLabel>
                <Select
                  labelId="programa-label"
                  value={programaSeleccionado}
                  onChange={(e) => setProgramaSeleccionado(e.target.value)}
                  label="Selecciona un Programa"
                >
                  {programas.map((programa) => (
                    <MenuItem key={programa.id} value={programa.id}>
                      {programa.nombre}
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
              whileHover="hover"
              whileTap="tap"
              onClick={handleAsignar}
            >
              <FaPlus /> Asignar
            </motion.button>
          </div>

          {/* Tabla de Asignaciones con estilo y animaciones */}
          <TableContainer component={Paper} sx={{ marginTop: '20px', backgroundColor: '#2d3748' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#4a5568' }}>
                <TableRow>
                  <TableCell sx={{ color: '#fff' }}>ID</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Coordinador</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Programa</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {asignaciones.map((asignacion) => (
                    <motion.tr
                      key={asignacion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.5 }}
                      style={{ borderBottom: '1px solid #4a5568' }}
                    >
                      <TableCell sx={{ color: '#fff' }}>{asignacion.id}</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{asignacion.coordinador}</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{asignacion.programa}</TableCell>
                      <TableCell sx={{ color: '#fff' }}>
                        <motion.button
                          className="bg-red-500 text-white px-4 py-2 rounded-full"
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => handleEliminar(asignacion.id)}
                        >
                          <FaTrashAlt />
                        </motion.button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Ventana emergente de confirmación de eliminación */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"¿Estás seguro de eliminar esta asignación?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Esta acción no se puede deshacer. ¿Deseas continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <motion.button
            className="bg-gray-500 text-white px-4 py-2 rounded-full"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => setIsDeleteConfirmOpen(false)}
          >
            Cancelar
          </motion.button>
          <motion.button
            className="bg-red-500 text-white px-4 py-2 rounded-full"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={confirmDelete}
          >
            Eliminar
          </motion.button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default AsignacionesCoord_Pro;
