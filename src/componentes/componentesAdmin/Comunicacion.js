import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, MenuItem, Select, FormControl, InputLabel, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';

const Comunicacion = () => {
  const [adminSeleccionado, setAdminSeleccionado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [mensajesRecibidos, setMensajesRecibidos] = useState([]); // Estado para los mensajes recibidos

  // Datos de ejemplo para los administradores
  const admins = [
    { id: 1, name: 'Admin 1' },
    { id: 2, name: 'Admin 2' },
    { id: 3, name: 'Admin 3' }
  ];

  // Función para manejar el cambio en el Select
  const handleSelectChange = (e) => {
    setAdminSeleccionado(e.target.value);
  };

  // Función para manejar el cambio en el campo de texto
  const handleTextChange = (e) => {
    setMensaje(e.target.value);
  };

  // Variantes de animación para el botón
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95, transition: { duration: 0.2 } },
  };

  // Función para enviar el mensaje
  const enviarMensaje = () => {
    if (!adminSeleccionado) {
      alert("Por favor selecciona un administrador.");
    } else if (!mensaje) {
      alert("Por favor escribe un mensaje.");
    } else {
      alert(`Mensaje enviado a ${admins.find(admin => admin.id === adminSeleccionado)?.name}: "${mensaje}"`);
      
      // Aquí se enviaría el mensaje a tu backend
      // axios.post('TU_API_ENDPOINT', { admin: adminSeleccionado, mensaje })
      //   .then(response => { console.log("Mensaje enviado:", response.data); })
      //   .catch(error => { console.error("Error enviando el mensaje:", error); });
    }
  };

  // Función para obtener los mensajes recibidos (simulación)
  useEffect(() => {
    const obtenerMensajesRecibidos = async () => {
      try {
        // Simulación de petición a la API para obtener los mensajes
        // const response = await axios.get('TU_API_ENDPOINT');
        // setMensajesRecibidos(response.data);

        // Ejemplo de mensajes obtenidos
        const mensajesEjemplo = [
          { id: 1, remitente: 'Usuario 1', contenido: 'Hola Admin 1, ¿podrías ayudarme?' },
          { id: 2, remitente: 'Usuario 2', contenido: 'Tengo una duda sobre el programa.' },
          { id: 3, remitente: 'Usuario 3', contenido: 'Gracias por tu apoyo en el proyecto.' }
        ];
        setMensajesRecibidos(mensajesEjemplo);
      } catch (error) {
        console.error('Error al obtener los mensajes:', error);
      }
    };

    obtenerMensajesRecibidos();
  }, []);

  return (
    <motion.div
      className="max-w-6xl mx-auto mt-2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Título "Asignación" */}
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Contacto
      </Typography>
      <Card sx={{ backgroundColor: '#1e293b', color: '#fff', padding: '20px', borderRadius: '15px' }}>
        <CardContent>
          <Typography variant="h4" color="white" gutterBottom>
            Selecciona un Usuario para escribir un mensaje
          </Typography>

          {/* Select para elegir el administrador */}
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ backgroundColor: '#fff', borderRadius: '5px' }}>
                <InputLabel id="admin-label" sx={{ color: 'black' }}>Selecciona un Usuario</InputLabel>
                <Select
                  labelId="admin-label"
                  value={adminSeleccionado}
                  onChange={handleSelectChange}
                  label="Selecciona un Administrador"
                  sx={{
                    '.MuiSelect-select': {
                      color: adminSeleccionado ? 'black' : 'inherit',
                    }
                  }}
                >
                  {admins.map((admin) => (
                    <MenuItem key={admin.id} value={admin.id}>
                      {admin.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Campo de texto debajo del Select */}
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    placeholder="Escribe un mensaje"
                    multiline
                    rows={4}
                    value={mensaje}
                    onChange={handleTextChange}
                    variant="outlined"
                    InputProps={{
                    style: { color: 'black', backgroundColor: '#fff', borderRadius: '5px' }, // Asegura que el texto y el placeholder sean visibles
                    }}
                    sx={{ marginTop: '20px' }}  // Estilos de separación
                    />
            </Grid>
          </Grid>

          {/* Botón para enviar mensaje simulado */}
          <div className="mt-6 flex justify-end">
            <motion.button
              className="bg-green-500 text-white px-4 py-2 rounded-full"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={enviarMensaje} // Llamada a la función que simula el envío
            >
              Enviar Mensaje
            </motion.button>
          </div>
        </CardContent>
      </Card>

      {/* Sección para mostrar mensajes recibidos */}
      <Typography variant="h4" align="center" color="primary" gutterBottom style={{ marginTop: '40px' }}>
        Mensajes Recibidos
      </Typography>
      <Card sx={{ backgroundColor: '#1e293b', color: '#fff', padding: '20px', borderRadius: '15px' }}>
        <CardContent>
          <List>
            {mensajesRecibidos.length > 0 ? (
              mensajesRecibidos.map((mensaje) => (
                <ListItem key={mensaje.id}>
                  <ListItemText primary={mensaje.remitente} secondary={mensaje.contenido} />
                </ListItem>
              ))
            ) : (
              <Typography variant="h6" color="white">
                No hay mensajes recibidos.
              </Typography>
            )}
          </List>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Comunicacion;
