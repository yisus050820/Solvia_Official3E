import React, { useState } from 'react';
import {
  Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, TextField
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';

const Donar = () => {
  const [cantidad, setCantidad] = useState('');
  const [donaciones, setDonaciones] = useState([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const handleDonar = () => {
    if (cantidad > 0) {
      const nuevaDonacion = {
        id: donaciones.length + 1, // Generar un ID simple
        cantidad: Number(cantidad).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
        fecha: new Date().toISOString().split('T')[0] // Fecha en formato YYYY-MM-DD
      };
      setDonaciones([...donaciones, nuevaDonacion]);
      setCantidad('');
    }
  };

  const handleEliminar = (id) => {
    setIsDeleteConfirmOpen(true);
    setCurrentId(id);
  };

  const confirmDelete = () => {
    setDonaciones(donaciones.filter(donacion => donacion.id !== currentId));
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
            Donar Cantidad
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cantidad a Donar (MXN)"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                type="number"
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '5px',
                  '& .MuiInputBase-input': { color: 'black' },
                  '& .MuiInputLabel-root': { color: 'black' },
                }}
              />
            </Grid>
          </Grid>
          <div className="mt-6 flex justify-end">
            <motion.button
              className="bg-green-500 text-white px-4 py-2 rounded-full"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={handleDonar}
            >
              <FaPlus />
            </motion.button>
          </div>

          {/* Tabla de Donaciones */}
          <TableContainer component={Paper} sx={{ marginTop: '20px', backgroundColor: '#2d3748' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#4a5568' }}>
                <TableRow>
                  <TableCell sx={{ color: '#fff' }}>ID</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Cantidad</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Fecha</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {donaciones.map((donacion) => (
                    <motion.tr
                      key={donacion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.5 }}
                      style={{ borderBottom: '1px solid #4a5568' }}
                    >
                      <TableCell sx={{ color: '#fff' }}>{donacion.id}</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{donacion.cantidad}</TableCell>
                      <TableCell sx={{ color: '#fff' }}>{donacion.fecha}</TableCell>
                      <TableCell sx={{ color: '#fff' }}>
                        <motion.button
                          className="bg-red-500 text-white px-4 py-2 rounded-full"
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => handleEliminar(donacion.id)}
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
        <DialogTitle id="alert-dialog-title">{"¿Estás seguro de eliminar esta donación?"}</DialogTitle>
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

export default Donar;
