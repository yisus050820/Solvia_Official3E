import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Dialog, Typography, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar, Alert } from '@mui/material';

const defaultProgramPicture = 'https://via.placeholder.com/150/000000/FFFFFF/?text=Nuevo+Programa';

const CrudProgramas = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [newProgram, setNewProgram] = useState({ nombre: '', descripcion: '', fechaInicio: null, fechaFin: null, objetivos: '', coordinador: '', program_image: '' });
  const [editProgram, setEditProgram] = useState(null);
  const [coordinadores, setCoordinadores] = useState([]);
  const [today] = useState(new Date());
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [errors, setErrors] = useState({});
  const [originalProgram, setOriginalProgram] = useState(null);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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

  const validateProgram = (program, originalProgram = {}, isEditing = false) => {
    const validationErrors = {};
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0); 

    if (!isEditing || (isEditing && program.descripcion !== originalProgram.descripcion)) {
      if (program.descripcion.length < 10) {
        validationErrors.descripcion = 'La descripción debe tener al menos 10 caracteres.';
      }
    }

    if (!isEditing && !program.fechaInicio || (isEditing && program.fechaInicio !== originalProgram.fechaInicio)) {
      validationErrors.fechaInicio = 'La fecha de inicio es obligatoria.';
    } else if (new Date(program.fechaInicio) < todayDate) {
      validationErrors.fechaInicio = 'La fecha de inicio no puede ser anterior a la fecha actual.';
    }

    if (!isEditing && !program.fechaFin || (isEditing && program.fechaFin !== originalProgram.fechaFin)) {
      if (program.fechaInicio && new Date(program.fechaFin) < new Date(program.fechaInicio)) {
        validationErrors.fechaFin = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
      }
    }

    if (!isEditing || (isEditing && program.objetivos !== originalProgram.objetivos)) {
      if (program.objetivos.length < 10) {
        validationErrors.objetivos = 'Los objetivos no pueden estar vacíos y deben tener al menos 10 caracteres.';
      }
    }

    if (!program.coordinador || isNaN(program.coordinador)) {
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
    const validationErrors = validateProgram(newProgram, {}, false);

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
      })
      .catch(error => {
        console.error('Error al añadir programa:', error);
        setMessage('Error al añadir el programa, intente más tarde.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
  };

  const handleEditProgram = () => {
    const validationErrors = validateProgram(editProgram);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showErrorMessage(validationErrors);
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
      })
      .catch(error => {
        console.error('Error deleting program:', error);
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

  return (
    <>
      <div className="w-full px-6 py-0.1 mx-auto mt-2">
        {/* Título encima del contenido */}
        <Typography variant="h3" align="center" color="primary" sx={{ marginBottom: 0 }}>
          Gestionar Programas
        </Typography>
        <div className="flex justify-end mb-4 space-x-4">
          <motion.button
            className="bg-green-500 text-white p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOpenModal}
          >
            <FaPlus />
          </motion.button>
        </div>

        <motion.table className="w-full bg-gray-800 text-white rounded-lg shadow-md">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4">ID</th>
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
            {data.map((item) => (
              <motion.tr key={item.id} className="border-b border-gray-700">
                <td className="p-4">{item.id}</td>
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
                <td className="p-4 flex space-x-4">
                  <motion.button
                    className="bg-blue-500 text-white p-2 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleOpenEditModal(item)}
                  >
                    <FaEdit />
                  </motion.button>
                  <motion.button
                    className="bg-red-500 text-white p-2 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => handleDeleteConfirm(item.id)}
                  >
                    <FaTrashAlt />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </motion.table>
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
                  whileHover={{ backgroundColor: '#38a169' }}
                  onClick={handleAddProgram}
                >
                  Agregar
                </motion.button>
                <motion.button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#636363' }}
                  onClick={handleCloseModal}
                >
                  Cerrar
                </motion.button>
              </div>
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
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholderText="Fecha de Inicio"
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
                {errors.coordinador && <p className="text-red-500 text-sm">{errors.coordinador}</p>}
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
                  whileHover={{ backgroundColor: '#4A90E2' }}
                  onClick={handleEditProgram}
                >
                  Guardar Cambios
                </motion.button>
                <motion.button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#636363' }}
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
            onClick={() => setIsDeleteConfirmOpen(false)}
          >
            Cancelar
          </motion.button>
          <motion.button
            className="bg-red-500 text-white px-4 py-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            onClick={handleDelete}
          >
            Eliminar
          </motion.button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CrudProgramas;
