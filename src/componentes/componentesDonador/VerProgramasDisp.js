import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Snackbar, Alert, Switch, Typography, TextField } from '@mui/material';
const defaultProgramPicture = 'https://via.placeholder.com/150/000000/FFFFFF/?text=Nuevo+Programa';

const ProgramasDisp = () => {
  const [program, setProgram] = useState([]);
  const [mostrarCards, setMostrarCards] = useState(false);
  const [today] = useState(new Date());
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [atBottom, setAtBottom] = useState(true);
  const programListRef = useRef(null);
  const modalContentRef = useRef(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleScroll = () => {
    const modalContent = modalContentRef.current;
    if (modalContent) {
      setAtBottom(
        Math.ceil(modalContent.scrollTop + modalContent.clientHeight) >= modalContent.scrollHeight
      );
    }
  };

  useEffect(() => {
    const modalContent = modalContentRef.current;
    if (modalContent && atBottom) {
      modalContent.scrollTop = modalContent.scrollHeight;
    }
  }, [selectedProgram, atBottom]);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const fetchPrograms = () => {

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }

    axios.get('http://localhost:5000/programas')
      .then(response => {
        setProgram(response.data);
      })
      .catch(error => {
        console.error('Error fetching programs:', error);
      });
  };

  const truncateDescription = (description) => {
    if (!description) return '';
    return description.length > 50 ? description.slice(0, 50) + '...' : description;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pause':
        return 'bg-yellow-500';
      case 'unactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const statusTranslation = {
    active: 'activo',
    pause: 'pausado',
    unactive: 'inactivo'
  };
  
  const filteredPrograms = program.filter((program) => {
    const search = searchTerm.toLowerCase();
  
    // Obtener la traducción del estado actual del programa
    const translatedStatus = statusTranslation[program.status];
  
    return (
      (program.name && program.name.toLowerCase().includes(search)) ||
      (program.description && program.description.toLowerCase().includes(search)) ||
      (program.start_date && program.start_date.toLowerCase().includes(search)) ||
      (program.end_date && program.end_date.toLowerCase().includes(search)) ||
      (program.objectives && program.objectives.toLowerCase().includes(search)) ||
      (program.coordinator_name && program.coordinator_name.toLowerCase().includes(search)) ||
      (program.status && program.status.toLowerCase().includes(search)) ||
      (translatedStatus && translatedStatus.toLowerCase().includes(search))
    );
  });  

  return (
    <>
      <div className="w-full px-6 py-0.1 mx-auto mt-2">
        <Typography variant="h3" align="center" color="primary" sx={{ marginBottom: 0 }}>
          Programas
        </Typography>
        <div className="flex justify-between mb-4 space-x-4">
          <div className="flex items-center space-x-2">
            <Typography variant="body1" color="primary" className="mr-2">
              Ver en tarjetas
            </Typography>
            <Switch
              checked={mostrarCards}
              onChange={() => setMostrarCards(!mostrarCards)}
              sx={{
                '& .MuiSwitch-thumb': {
                  backgroundColor: '#92DCE5', // Aqua
                },
                '& .MuiSwitch-track': {
                  backgroundColor: '#7C7C7C', // Gris oscuro
                },
              }}
            />
          </div>
          <div className="flex items-center space-x-2">
            <TextField
              fullWidth
              label="Buscar..."
              variant="outlined"
              sx={{
                backgroundColor: '#EEE5E9', // Fondo de input
                color: '#383D3B', // Texto del input
                borderRadius: '5px',
                '& .MuiOutlinedInput-root': {
                  height: '36px',
                  fontSize: '0.9rem',
                  '& input': { color: '#383D3B', padding: '8px 14px' },
                  '& fieldset': { borderColor: '#7C7C7C' },
                  '&:hover fieldset': { borderColor: '#383D3B' },
                  '&.Mui-focused fieldset': { borderColor: '#92DCE5' },
                },
                '& .MuiInputLabel-root': {
                  color: '#7C7C7C',
                  fontSize: '0.9rem',
                  top: '-6px',
                },
              }}

              onChange={handleSearchChange}
            />
          </div>
        </div>

        {mostrarCards ? (
          <div
            ref={programListRef}
            onScroll={handleScroll}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
          >
            {filteredPrograms.map((program) => (
              <motion.div
                key={program.id}
                className="max-w-sm bg-[#383d3b] rounded-xl shadow-lg overflow-hidden m-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  className="w-full h-48 object-cover"
                  src={program.program_image ? `http://localhost:5000${program.program_image}` : defaultProgramPicture}
                  alt={program.name}
                />
                <div className="p-4">
                  <h2 className="text-white text-xl font-bold">{program.name}</h2>
                  <div className="flex items-center mt-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(program.status)}`}></span>
                    <span className="ml-2 text-gray-400 capitalize">{program.status}</span>
                  </div>
                  <p className="text-white mt-2">
                    {truncateDescription(program.description)}
                  </p>
                  <div className="mt-2">
                    <span className="text-green-600">Presupuesto: ${program.donations || 0}</span>
                  </div>
                  <div className="flex mt-4 justify-between">
                    <motion.button
                      className="bg-[#0097A7] text-white px-4 py-2 rounded"
                      whileHover={{ scale: 1.1 }}
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
          <motion.table
            className="w-full rounded-lg shadow-md"
            style={{ backgroundColor: '#383D3B', color: '#EEE5E9' }}
          >
            <thead style={{ backgroundColor: '#2D2D2D' }}>
              <tr>
                <th className="p-4">Nombre</th>
                <th className="p-4">Correo</th>
                <th className="p-4">Fecha de nacimiento</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Descripción</th>
                <th className="p-4">Fecha Creación</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>
            <motion.tbody layout className="bg-383D3B">
              {filteredPrograms.map((item) => (
                <motion.tr key={item.id} className="border-b border-gray-700">
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{truncateDescription(item.description)}</td>
                  <td className="p-4">{item.start_date.split('T')[0]}</td>
                  <td className="p-4">{item.end_date.split('T')[0]}</td>
                  <td className="p-4">{truncateDescription(item.objectives)}</td>
                  <td className="p-4">{item.coordinator_name}</td>
                  <td className="p-4">
                    <span
                      className={`text-lg font-bold ${item.status === 'active'
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

      {/* Modal para más información */}
      <AnimatePresence>
        {selectedProgram && (
          <motion.div
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#383d3b] text-white p-8 rounded-xl shadow-lg max-w-lg w-full"
              initial={{ y: "-100vh" }}
              animate={{ y: "0" }}
              exit={{ y: "-100vh" }}
              ref={modalContentRef}
              onScroll={handleScroll}
              style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h2 className="text-white text-3xl font-bold">{selectedProgram.name}</h2>
              <h4 className="text-white-900 mb-4 font-semibold">
                Coordinador: {selectedProgram.coordinator_name}
              </h4>
              <img
                className="w-full h-48 object-cover shadow-md rounded"
                src={selectedProgram.program_image ? `http://localhost:5000${selectedProgram.program_image}` : defaultProgramPicture}
                alt={selectedProgram.name}
              />
              <p className="mt-4" style={{ color: 'white' }}>
                Descripción: {selectedProgram.description}
              </p>
              <p className="mt-4" style={{ color: 'white' }}>
                Objetivo: {selectedProgram.objectives}
              </p>
              <p className="mt-4" style={{ color: 'white' }}>
                Fecha de Inicio: {selectedProgram.start_date ? selectedProgram.start_date.split('T')[0] : 'No definida'}
              </p>
              <p className="mt-4" style={{ color: 'white' }}>
                Fecha de Fin: {selectedProgram.end_date ? selectedProgram.end_date.split('T')[0] : 'No definida'}
              </p>
              <div className="mt-2">

                <span className="text-green-600">Presupuesto: ${selectedProgram.donations || 0}</span>
              </div>
              <motion.button
                className="mt-4 bg-[#E63946] text-white px-4 py-2 rounded"
                whileHover={{ scale: 1.1 }}
                onClick={() => setSelectedProgram(null)}
              >
                Cerrar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProgramasDisp;
