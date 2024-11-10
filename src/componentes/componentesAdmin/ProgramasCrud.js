import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrashAlt, FaPlus, FaCheck} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Dialog, Typography, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar, Alert, Switch, TextField } from '@mui/material';
const defaultProgramPicture = 'https://via.placeholder.com/150/000000/FFFFFF/?text=Nuevo+Programa';

const CrudProgramas = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [newProgram, setNewProgram] = useState({ nombre: '', descripcion: '', fechaInicio: null, fechaFin: null, objetivos: '', coordinador: '', program_image: '' });
  const [editProgram, setEditProgram] = useState(null);
  const [mostrarCards, setMostrarCards] = useState(false);
  const [coordinadores, setCoordinadores] = useState([]);
  const [today] = useState(new Date());
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [errors, setErrors] = useState({});
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [originalProgram, setOriginalProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda


  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
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

    //Alerta se cierra automaticamente despues de 5 segundos
    useEffect(() => {
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage('');
        }, 1000); // definir en cuanto tiempo desaparecera la alerta, se mide en ms (3 segundos)
  
      }
    }, [successMessage]);
  
  useEffect(() => {
    if (isModalOpen || isEditModalOpen) {
      axios.get('http://localhost:5000/usuarios/coordinadores')
        .then(response => {
          setCoordinadores(response.data);
        })
        .catch(error => {
          console.error('Error fetching coordinators:', error);
        });
    }
  }, [isModalOpen, isEditModalOpen]);

  const truncateDescription = (description) => {
    if (!description) return '';
    return description.length > 50 ? description.slice(0, 50) + '...' : description;
  };

  const formatDateForMySQL = (date) => {
    return date ? new Date(date).toISOString().split('T')[0] : '';
  };

  const handleOpenModal = () => {
    setNewProgram({ nombre: '', descripcion: '', fechaInicio: null, fechaFin: null, objetivos: '', coordinador: '', program_image: '' });
    setIsModalOpen(true);
    setErrors({});
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const filteredPrograms = data.filter(program => 
    program.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateProgram = (program, originalProgram, isEditing) => {
    const validationErrors = {};
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
  
    if (!isEditing || (isEditing && program.descripcion !== originalProgram.descripcion)) {
      if (!program.descripcion || program.descripcion.length < 10) {
        validationErrors.descripcion = 'La descripción debe tener al menos 10 caracteres.';
      }
    }    

    if (!isEditing && !program.fechaInicio) {
      validationErrors.fechaInicio = 'La fecha de inicio es obligatoria.';
    } else if (new Date(program.fechaInicio) < todayDate && !isEditing) {
      validationErrors.fechaInicio = 'La fecha de inicio no puede ser anterior a la fecha actual.';
    }
  
    if (!program.fechaFin || new Date(program.fechaFin) < new Date(program.fechaInicio)) {
      validationErrors.fechaFin = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
    }
  
    if (!isEditing || (isEditing && program.objetivos !== originalProgram.objetivos)) {
      if (program.objetivos.length < 10) {
        validationErrors.objetivos = 'Los objetivos no pueden estar vacíos y deben tener al menos 10 caracteres.';
      }
    }
  
    if (!program.coordinador || isNaN(Number(program.coordinador))) {
      validationErrors.coordinador = 'El coordinador es obligatorio y debe seleccionarse de la lista.';
    }
  
    return validationErrors;
  };
  
  const showErrorMessage = (errors) => {
    const firstError = Object.values(errors)[0];
    setMessage(firstError);
    setSnackbarSeverity('error');
    setOpenSnackbar(true);
  };

  const handleAddProgram = () => {
    const { nombre, descripcion, fechaInicio, fechaFin, objetivos, coordinador, program_image } = newProgram;

    // Verificación de campos vacíos
    const missingFields = [];
    if (!nombre) missingFields.push('Nombre');
    if (!descripcion) missingFields.push('Descripción');
    if (!fechaInicio) missingFields.push('Fecha de inicio');
    if (!fechaFin) missingFields.push('Fecha de fin');
    if (!objetivos) missingFields.push('Objetivos');
    if (!coordinador) missingFields.push('Coordinador');

    if (missingFields.length > 0) {
      setMessage(`Por favor, completa los siguientes campos: ${missingFields.join(', ')}`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Validación de los datos
    const validationErrors = validateProgram(newProgram, null, false);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      const firstError = Object.values(validationErrors)[0];
      setMessage(firstError);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Formateo de los datos para el envío
    const programData = {
      name: nombre,
      description: descripcion,
      start_date: formatDateForMySQL(fechaInicio),
      end_date: formatDateForMySQL(fechaFin),
      objectives: objetivos,
      coordinator_charge: coordinador,
      program_image: program_image || defaultProgramPicture,
      status: newProgram.status || 'active',
    };

    axios.post('http://localhost:5000/programas', programData)
      .then(() => {
        fetchPrograms();
        handleCloseModal();
        setSuccessMessage('Programa agregado exitosamente.');
        originalProgram = programData;
      })
      .catch(error => {
        console.error('Error al añadir programa:', error);
        setMessage('Error al añadir el programa, intente más tarde.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
  };

  const handleEditProgram = (program) => {
    console.log(editProgram)
    console.log(program)
    const validationErrors = validateProgram(editProgram, program, true);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      const firstError = Object.values(validationErrors)[0];
      setMessage(firstError);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const formData = new FormData();
    formData.append('name', editProgram.nombre);
    formData.append('description', editProgram.descripcion);
    formData.append('start_date', formatDateForMySQL(editProgram.fechaInicio));
    formData.append('end_date', formatDateForMySQL(editProgram.fechaFin));
    formData.append('objectives', editProgram.objetivos);
    formData.append('coordinator_charge', editProgram.coordinador);
    formData.append('status', editProgram.status || 'active');

    if (editProgram.program_image instanceof File) {
      formData.append('program_image', editProgram.program_image);
    } else {
      formData.append('program_image', editProgram.program_image);
    }

    axios.put(`http://localhost:5000/programas/${editProgram.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })
      .then(() => {
        fetchPrograms();
        handleCloseEditModal();
        setSuccessMessage('Programa actualizado exitosamente.')
      })
      .catch(error => {
        console.error('Error al actualizar programa:', error);
      });
  };

  const handleOpenEditModal = (program) => {
    setEditProgram({
      id: program.id,
      nombre: program.name,
      descripcion: program.description,
      fechaInicio: new Date(program.start_date),
      fechaFin: new Date(program.end_date),
      objetivos: program.objectives,
      coordinador: program.coordinator_charge,
      status: program.status || 'active',
      program_image: program.program_image || defaultProgramPicture,
    });
    setOriginalProgram({ ...program });
    setIsEditModalOpen(true);
    setErrors({});
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setErrors({});
  };

  const handleDeleteConfirm = (id) => {
    setCurrentId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    axios.delete(`http://localhost:5000/programas/${currentId}`)
      .then(() => {
        setData(data.filter(program => program.id !== currentId));
        setIsDeleteConfirmOpen(false);
        setCurrentId(null);
        setSuccessMessage('Programa eliminado exitosamente.')
      })
      .catch(error => {
        let errorMessage = 'Error al eliminar programa, intente más tarde.';
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        setMessage(errorMessage);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'new') {
        setNewProgram({ ...newProgram, program_image: file });
      } else if (type === 'edit') {
        setEditProgram({ ...editProgram, program_image: file });
      }
    }
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
            <TextField
    fullWidth
    label="Buscar..."
    variant="outlined"
    sx={{
      mb: 2,
      backgroundColor: 'white',          // Fondo blanco
      color: 'black',                     // Color del texto
      borderRadius: '5px',                // Bordes redondeados
      '& .MuiOutlinedInput-root': {
        height: '36px',                   // Altura total del input
        fontSize: '0.9rem',               // Tamaño del texto
        '& input': {
          color: 'black',                 // Color del texto en el campo de entrada
          padding: '8px 14px',            // Ajusta el padding interno
        },
        '& fieldset': {
          borderColor: '#ccc',            // Color del borde
        },
        '&:hover fieldset': {
          borderColor: '#888',            // Color de borde al pasar el cursor
        },
      },
      '& .MuiInputLabel-root': {
        color: '#888',                    // Color del texto de la etiqueta
        fontSize: '0.9rem',
        top: '-6px',                      // Ajusta la posición de la etiqueta
      },
    }}
              value={searchTerm}
              onChange={handleSearchChange}
            />
            </div>

                {/* mostrar el boton de agregar cuando el switch este desactivado (false) */}
            
          <motion.button
            className="bg-green-500 text-white p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOpenModal}
          >
            <FaPlus />
          </motion.button>
          
        </div>

        {mostrarCards ? (
          <div className="flex justify-center flex-wrap mt-2">
            {filteredPrograms.map((program) => (
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
                      whileTap={{scale: 0.9}}
                      onClick={() => setSelectedProgram(program)}
                    >
                      Más info
                    </motion.button>

                    <div className='flex space-x-2'>
                     {/* Botón de editar */}
                    <motion.button 
                      className="bg-blue-500 text-white p-2 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleOpenEditModal(program)}
                      >
                        <FaEdit />
                    </motion.button>
                    
                    {/* Botón de eliminar */}
                    <motion.button 
                      className="bg-red-500 text-white p-2 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteConfirm(program.id)}
                    >
                      <FaTrashAlt />
                      </motion.button>
                      </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ):(
          
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
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <motion.tbody layout className="bg-gray-900">
            {filteredPrograms.map((item) => (
                <motion.tr key={item.id} className="border-b border-gray-700">
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{truncateDescription(item.description)}</td>
                  <td className="p-4">{item.start_date.split('T')[0]}</td> 
                  <td className="p-4">{item.end_date.split('T')[0]}</td>   
                  <td className="p-4">{truncateDescription(truncateDescription(item.objectives))}</td>
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
                  <td className="p-4 flex space-x-4">
                    <motion.button
                      className="bg-blue-500 text-white p-2 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{scale: 0.9}}
                      onClick={() => handleOpenEditModal(item)}
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      className="bg-red-500 text-white p-2 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteConfirm(item.id)}
                    >
                      <FaTrashAlt />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </motion.table>
        )}
      </div>
      

      {/* Ventana emergente para agregar un nuevo registro */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-lg w-full"
              initial={{ y: "-100vh" }}
              animate={{ y: "0" }}
              exit={{ y: "-100vh" }}
            >
              <h2 className="text-white text-2xl font-bold mb-4">Agregar Nuevo Programa</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholder="Nombre"
                  value={newProgram.nombre}
                  onChange={(e) => setNewProgram({ ...newProgram, nombre: e.target.value })}
                />

                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholder="Descripción"
                  value={newProgram.descripcion}
                  onChange={(e) => setNewProgram({ ...newProgram, descripcion: e.target.value })}
                />

                <DatePicker
                  selected={newProgram.fechaInicio}
                  onChange={(date) => setNewProgram({ ...newProgram, fechaInicio: date })}
                  dateFormat="yyyy-MM-dd"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholderText="Fecha de Inicio"
                />

                <DatePicker
                  selected={newProgram.fechaFin}
                  onChange={(date) => setNewProgram({ ...newProgram, fechaFin: date })}
                  dateFormat="yyyy-MM-dd"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholderText="Fecha Final"
                />

                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholder="Objetivos"
                  value={newProgram.objetivos}
                  onChange={(e) => setNewProgram({ ...newProgram, objetivos: e.target.value })}
                />

                <select
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  value={newProgram.coordinador}
                  onChange={(e) => setNewProgram({ ...newProgram, coordinador: e.target.value })}
                >
                  <option value="">Selecciona un coordinador</option>
                  {coordinadores.map((coordinador) => (
                    <option key={coordinador.id} value={coordinador.id}>
                      {coordinador.name}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  value={newProgram.status || 'active'}
                  onChange={(e) => setNewProgram({ ...newProgram, status: e.target.value })}
                >
                  <option value="active">Activo</option>
                  <option value="pause">Pausado</option>
                  <option value="unactive">Inactivo</option>
                </select>
                <input
                  type="file"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'new')}
                />
              </div>
              <div className="flex justify-between mt-4">
                <motion.button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#38a169', scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddProgram}
                >
                  Agregar
                </motion.button>
                <motion.button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#636363', scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseModal}
                >
                  Cerrar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
  {selectedProgram && (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 text-white p-8 rounded-xl shadow-lg max-w-lg w-full"
        initial={{ y: "-100vh" }}
        animate={{ y: "0" }}
        exit={{ y: "-100vh" }}
      >
        <h2 className="text-white text-3xl font-bold">{selectedProgram.name}</h2>
        <h4 className="text-white-900 mb-4 font-semibold">Coordinador: {selectedProgram.coordinator_name}</h4>
        <img 
          className="w-full h-48 object-cover shadow-md rounded"
          src={selectedProgram.program_image ? `http://localhost:5000${selectedProgram.program_image}` : "https://via.placeholder.com/150"}
        />
        <p className="text-gray-400 mt-4 ">{selectedProgram.description}</p> {/* Muestra la descripción completa */}
        <div className="mt-2">
          <span className="text-green-700">Donaciones: ${selectedProgram.donations || 0}</span>
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


      {/* Ventana emergente para editar un registro existente */}
      <AnimatePresence>
        {isEditModalOpen && editProgram && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 p-8 rounded-xl shadow-lg max-w-lg w-full"
              initial={{ y: "-100vh" }}
              animate={{ y: "0" }}
              exit={{ y: "-100vh" }}
            >
              <h2 className="text-white text-2xl font-bold mb-4">Editar Programa</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholder="Nombre"
                  value={editProgram.nombre || ''}
                  onChange={(e) => setEditProgram({ ...editProgram, nombre: e.target.value })}
                />

                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholder="Descripción"
                  value={editProgram.descripcion || ''}
                  onChange={(e) => setEditProgram({ ...editProgram, descripcion: e.target.value })}
                />

                <DatePicker
                  selected={editProgram.fechaInicio}
                  onChange={(date) => setEditProgram({ ...editProgram, fechaInicio: date })}
                  dateFormat="yyyy-MM-dd"
                  className="w-full p-2 border border-gray-300 rounded bg-gray-300 text-black"
                  placeholderText="Fecha de Inicio"
                  disabled
                />

                <DatePicker
                  selected={editProgram.fechaFin}
                  onChange={(date) => setEditProgram({ ...editProgram, fechaFin: date })}
                  dateFormat="yyyy-MM-dd"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholderText="Fecha Final"
                />

                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholder="Objetivos"
                  value={editProgram.objetivos || ''}
                  onChange={(e) => setEditProgram({ ...editProgram, objetivos: e.target.value })}
                />

                <select
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  value={editProgram.coordinador || ''}
                  onChange={(e) => setEditProgram({ ...editProgram, coordinador: e.target.value })}
                >
                  <option value="">Selecciona un coordinador</option>
                  {coordinadores.map((coordinador) => (
                    <option key={coordinador.id} value={coordinador.id}>
                      {coordinador.name}
                    </option>
                  ))}
                </select>
                <select
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  value={editProgram.status || 'active'}
                  onChange={(e) => setEditProgram({ ...editProgram, status: e.target.value })}
                >
                  <option value="active">Activo</option>
                  <option value="pause">Pausado</option>
                  <option value="unactive">Inactivo</option>
                </select>
                <input
                  type="file"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'edit')}
                />
              </div>
              <div className="flex justify-between mt-4">
                <motion.button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#4A90E2', scale:1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleEditProgram}
                >
                  Guardar Cambios
                </motion.button>
                <motion.button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#636363',scale:1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseEditModal}
                >
                  Cerrar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"¿Estás seguro de eliminar este programa?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Esta acción no se puede deshacer. ¿Deseas continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <motion.button
            className="bg-gray-500 text-white px-4 py-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9}}
            onClick={() => setIsDeleteConfirmOpen(false)}
          >
            Cancelar
          </motion.button>
          <motion.button
            className="bg-red-500 text-white px-4 py-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9}}
            onClick={handleDelete}
          >
            Eliminar
          </motion.button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
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

    </>
  );
};

export default CrudProgramas;
