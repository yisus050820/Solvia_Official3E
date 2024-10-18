import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Button } from '@mui/material';
import { Visibility } from '@mui/icons-material';

const MensajesRecibidos = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    // Simulación de la petición al backend
    axios.get('http://localhost:5000/usuarios') // Cambia esto por tu API real
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleOpenDialog = (message) => {
    setSelectedMessage(message);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedMessage(null);
  };

  return (
    <>
      <div className="w-full px-6 py-0.1 mx-auto mt-2">
        <Typography variant="h3" align="center" color="primary" gutterBottom>
          Mensajes de los Usuarios
        </Typography>

        {/* Tabla con las etiquetas alineadas a la izquierda */}
        <motion.table className="w-full bg-gray-800 text-white rounded-lg shadow-md">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 text-left" style={{ textAlign: 'left', width: '35%' }}>Nombre</th>
              <th className="p-4 text-left" style={{ textAlign: 'left', width: '10%' }}>Rol</th>
              <th className="p-4 text-left" style={{ textAlign: 'left', width: '30%' }}>Mensaje</th>
              <th className="p-4 text-left" style={{ textAlign: 'left', width: '20%' }}>Fecha y Hora</th>
            </tr>
          </thead>
          <motion.tbody layout>
            {data.length > 0 ? (
              data.map((item) => (
                <motion.tr key={item.id} className="border-b border-gray-700">
                  <td className="p-4" style={{ textAlign: 'left' }}>{item.name}</td>
                  <td className="p-4" style={{ textAlign: 'left' }}>{item.role}</td>
                  <td className="p-4" style={{ textAlign: 'left' }}>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenDialog(item.MensajesRecibidos)}
                    >
                      <Visibility />
                    </IconButton>
                  </td>
                  <td className="p-4" style={{ textAlign: 'left' }}>{item.date}</td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  No hay datos disponibles
                </td>
              </tr>
            )}
          </motion.tbody>
        </motion.table>
      </div>

      {/* Dialog para mostrar el mensaje recibido con AnimatePresence */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.5 }}
          >
            <Dialog open={open} onClose={handleCloseDialog}>
              <DialogTitle>Mensaje Recibido</DialogTitle>
              <DialogContent>
                {selectedMessage ? (
                  <Card>
                    <CardContent>
                      <Typography variant="body1" color="textSecondary">
                        {selectedMessage}
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <Typography>No hay mensaje para mostrar</Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog} color="primary">
                  Cerrar
                </Button>
              </DialogActions>
            </Dialog>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MensajesRecibidos;
