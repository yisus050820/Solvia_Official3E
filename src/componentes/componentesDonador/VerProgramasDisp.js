import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Snackbar, Alert, Switch, Typography } from '@mui/material';
const defaultProgramPicture = 'https://via.placeholder.com/150/000000/FFFFFF/?text=Nuevo+Programa';

const ProgramasDisp = () => {
  const [data, setData] = useState([]);
  const [mostrarCards, setMostrarCards] = useState(false);
  const [today] = useState(new Date());
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito

  // Variantes de animación para la palomita
  const checkmarkVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: { opacity: 1, pathLength: 1 },
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = () => {
    axios.get('http://localhost:5000/programas')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching programs:', error);
      });
  };

  // Alerta se cierra automáticamente después de 5 segundos
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        setSuccessMessage('');
      }, 1000); // definir en cuanto tiempo desaparecerá la alerta, se mide en ms (3 segundos)
    }
  }, [successMessage]);

  const truncateDescription = (description) => {
    if (!description) return '';
    return description.length > 50 ? description.slice(0, 50) + '...' : description;
  };

  // Función para determinar el color del estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';  // Verde para activo
      case 'pause':
        return 'bg-yellow-500'; // Amarillo para pausado
      case 'unactive':
        return 'bg-red-500';    // Rojo para inactivo
      default:
        return 'bg-gray-500';   // Gris por defecto
    }
  };

  return (
    <>
      <div className="w-full px-6 py-0.1 mx-auto mt-2">
        {/* Título encima del contenido */}
        <Typography variant="h3" align="center" color="primary" sx={{ marginBottom: 0 }}>
          Gestionar Programas
        </Typography>
        <div className="flex justify-between mb-4 space-x-4">
          <div className="flex items-center space-x-2">
            <Typography variant="body1" color="primary" className="mr-2">
              Ver en tarjetas
            </Typography>
            <Switch
              checked={mostrarCards}
              onChange={() => setMostrarCards(!mostrarCards)}
              color="primary"
            />
          </div>
        </div>

        {mostrarCards ? (
          <div className="flex justify-center flex-wrap mt-2">
            {data.map((program) => (
              <motion.div 
                key={program.id}
                className="max-w-sm bg-gray-800 rounded-xl shadow-lg overflow-hidden m-2"
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <img
                  className="w-full h-48 object-cover"
                  src={program.program_image ? `http://localhost:5000${program.program_image}` : "https://via.placeholder.com/150"}
                  alt={program.name}
                />
                <div className="p-4">
                  <h2 className="text-white text-xl font-bold">{program.name}</h2>
                  <div className="flex items-center mt-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(program.status)}`}></span>
                    <span className="ml-2 text-gray-400 capitalize">{program.status}</span>
                  </div>
                  <p className="text-gray-400 mt-2">
                    {program.description && program.description.length > 100 ? `${program.description.substring(0, 100)}...` : program.description}
                  </p>
                  <div className="mt-2">
                    <span className="text-green-600">Presupuesto: ${program.donations || 0}</span>
                  </div>
                  <div className="flex mt-4 justify-between">
                    <motion.button 
                      className="bg-gray-700 text-white px-4 py-2 rounded"
                      whileHover={{ backgroundColor: '#636363', scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedProgram(program)}
                    >
                      Más info
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.table className="w-full bg-gray-800 text-white rounded-lg shadow-md">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4">Nombre</th>
                <th className="p-4">Descripción</th>
                <th className="p-4">Fecha Inicio</th>
                <th className="p-4">Fecha Fin</th>
                <th className="p-4">Objetivos</th>
                <th className="p-4">Coordinador</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>
            <motion.tbody layout className="bg-gray-900">
              {data.map((item) => (
                <motion.tr key={item.id} className="border-b border-gray-700">
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{truncateDescription(item.description)}</td>
                  <td className="p-4">{item.start_date.split('T')[0]}</td>
                  <td className="p-4">{item.end_date.split('T')[0]}</td>
                  <td className="p-4">{truncateDescription(item.objectives)}</td>
                  <td className="p-4">{item.coordinator_name}</td>
                  <td className="p-4">
                    <span
                      className={`text-lg font-bold ${
                        item.status === 'active'
                          ? 'text-green-500'
                          : item.status === 'pause'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}
                    >
                      {item.status === 'active' ? 'Activo' : item.status === 'pause' ? 'Pausado' : 'Inactivo'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </motion.table>
        )}
      </div>

      <AnimatePresence>
        {selectedProgram && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full"
              initial={{ y: "-100vh" }}
              animate={{ y: "0" }}
              exit={{ y: "-100vh" }}
            >
              <h2 className="text-black text-2xl font-bold mb-4">{selectedProgram.name}</h2>
              <p className="text-gray-600">{selectedProgram.description}</p> {/* Muestra la descripción completa */}
              <div className="mt-4">
                <span className="text-green-400">Coordinador: {selectedProgram.coordinator_name}</span>
              </div>
              <div className="mt-2">
                <span className="text-green-600">Donaciones: ${selectedProgram.donations || 0}</span>
              </div>
              {/* Botón para cerrar la ventana */}
              <motion.button 
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                whileHover={{ backgroundColor: '#4A90E2' }}
                onClick={() => setSelectedProgram(null)}  // Cierra el modal
              >
                Cerrar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>

      {/* Modal para mensajes de éxito */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeIn" }}  // Animaciones de entrada/salida
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <motion.div 
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}  // Efecto de resorte en la entrada/salida
              className="bg-gray-800 p-6 rounded-xl shadow-lg"
            >
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
    </>
  );
};

export default ProgramasDisp;
