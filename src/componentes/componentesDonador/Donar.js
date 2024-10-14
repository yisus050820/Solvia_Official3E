import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, TextField
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrashAlt, FaCheck } from 'react-icons/fa';

const Donar = () => {
  const [cantidad, setCantidad] = useState('');
  const [donaciones, setDonaciones] = useState([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito


  const handleDonar = () => {
    if (cantidad > 0) {
      const nuevaDonacion = {
        id: donaciones.length + 1, // Generar un ID simple
        cantidad: Number(cantidad).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
        fecha: new Date().toISOString().split('T')[0] // Fecha en formato YYYY-MM-DD
      };
      setDonaciones([...donaciones, nuevaDonacion]);
      setCantidad('');
      setSuccessMessage('Donacion hecha exitosamente.'); // Mostrar mensaje de éxito
    }
  };

      // Variantes de animación para la palomita
  const checkmarkVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: { opacity: 1, pathLength: 1 },
  };

  const handleEliminar = (id) => {
    setIsDeleteConfirmOpen(true);
    setCurrentId(id);
  };

  const confirmDelete = () => {
    setDonaciones(donaciones.filter(donacion => donacion.id !== currentId));
    setIsDeleteConfirmOpen(false);
    setSuccessMessage('Donacion eliminada exitosamente.'); // Mostrar mensaje de éxito
  };

  const buttonVariants = {
    hover: { scale: 1.1, transition: { duration: 0.3 } },
    tap: { scale: 0.9, transition: { duration: 0.2 } },
  };

    //Alerta se cierra automaticamente despues de 5 segundos
    useEffect(() => {
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage('');
        }, 1000); // definir en cuanto tiempo desaparecera la alerta, se mide en ms (3 segundos)
  
      }
    }, [successMessage]);

  return (
    <motion.div
      className="max-w-6xl mx-auto mt-2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
    <Typography variant="h3" align="center" color="primary" gutterBottom>
      Donar
    </Typography>
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
       {/* Modal para mensajes de éxito */}
       <AnimatePresence>
      {successMessage && (
        <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2, ease: "easeIn" }}  // Animaciones de entrada/salida
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <motion.div 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          exit={{ y: 50 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}  // Efecto de resorte en la entrada/salida
          className="bg-gray-800 p-6 rounded-xl shadow-lg">
                        {/* Icono de palomita */}
                     
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
                borderRadius: '50%',        // Hace que sea un círculo
                backgroundColor: '#4CAF50', // Color de fondo verde
                width: '80px',              // Tamaño del círculo
                height: '80px',             // Tamaño del círculo
                display: 'flex',            // Para alinear el contenido
                justifyContent: 'center',   // Centra horizontalmente
                alignItems: 'center'        // Centra verticalmente
              }}
            >
              <FaCheck size={50} className="text-white"/>
            </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
              </AnimatePresence>
    </motion.div>
    
  );
};

export default Donar;
