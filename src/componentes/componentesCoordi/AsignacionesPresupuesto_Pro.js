import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid, MenuItem, Select, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';

const AsignacionPresupuesto_Pro = () => {
const [programaSeleccionado, setProgramaSeleccionado] = useState('');
const [presupuesto, setPresupuesto] = useState('');
const [asignaciones, setAsignaciones] = useState([]);
const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
const [currentId, setCurrentId] = useState(null);

const programas = [
    { id: 1, nombre: 'Programa de Ayuda Alimentaria' },
    { id: 2, nombre: 'Programa de Educación' },
    { id: 3, nombre: 'Programa de Salud' },
];

const handleAsignar = () => {
    if (programaSeleccionado && presupuesto > 0) {
    const nuevaAsignacion = {
        programa: programas.find(p => p.id === programaSeleccionado).nombre,
        presupuesto: Number(presupuesto).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
    };
    setAsignaciones([...asignaciones, nuevaAsignacion]);
    setProgramaSeleccionado('');
    setPresupuesto('');
    }
};

const handleEliminar = (id) => {
    setIsDeleteConfirmOpen(true);
    setCurrentId(id);
};

const handleLogout = () => {
    localStorage.clear(); 
    delete axios.defaults.headers.common['Authorization']; 
    window.location.href = '/index'; 
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
                        {/* Botón de cerrar sesión */}
                        <button
        onClick={handleLogout}
        style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
          backgroundColor: '#ff0000', // Rojo brillante
        color: 'white',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '5px',
        fontSize: '14px',
        cursor: 'pointer',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
        zIndex: 9999,
        }}
    >
        Cerrar sesión
    </button>
    <Card sx={{ backgroundColor: '#1e293b', color: '#fff', padding: '20px', borderRadius: '15px' }}>
        <CardContent>
        <Typography variant="h4" color="white" gutterBottom>
            Asignar Presupuesto a Programa
        </Typography>
        <Grid container spacing={4}>
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
                    {programa.nombre}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
            <TextField
                fullWidth
                label="Presupuesto (MXN)"
                value={presupuesto}
                onChange={(e) => setPresupuesto(e.target.value)}
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
            onClick={handleAsignar}
            >
            <FaPlus />
            </motion.button>
        </div>

          {/* Tabla de Asignaciones con estilo y animaciones */}
        <TableContainer component={Paper} sx={{ marginTop: '20px', backgroundColor: '#2d3748' }}>
            <Table>
            <TableHead sx={{ backgroundColor: '#4a5568' }}>
                <TableRow>
                <TableCell sx={{ color: '#fff' }}>Programa</TableCell>
                <TableCell sx={{ color: '#fff' }}>Presupuesto Asignado</TableCell>
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
                    <TableCell sx={{ color: '#fff' }}>{asignacion.programa}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{asignacion.presupuesto}</TableCell>
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
        <DialogTitle id="alert-dialog-title">{"¿Estás seguro de eliminar esta asignación de presupuesto?"}</DialogTitle>
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

export default AsignacionPresupuesto_Pro;
