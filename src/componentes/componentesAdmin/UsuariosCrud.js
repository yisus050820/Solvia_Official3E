import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrashAlt, FaPlus, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar, Alert, Switch, TextField } from '@mui/material';
import { ReceiptEuroIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const defaultProfilePicture = 'https://via.placeholder.com/150/000000/FFFFFF/?text=Nuevo+Usuario';

const CrudUsuarios = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', birth_date: null, role: 'admin', description: '', profile_picture: defaultProfilePicture, password: '' });
  const [editUser, setEditUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [filtroRol, setFiltroRol] = useState('');
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [errors, setErrors] = useState({});
  const [mostrarCards, setMostrarCards] = useState(false); // Estado para el switch de tarjetas
  const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda


  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Variantes de animación para la palomita
  const checkmarkVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: { opacity: 1, pathLength: 1 },
  };

  useEffect(() => {
    axios.get('http://localhost:5000/usuarios')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const truncateDescription = (description) => {
    if (!description) return '';
    return description.length > 50 ? description.slice(0, 50) + '...' : description;
  };

  //Alerta se cierra automaticamente despues de 5 segundos
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        setSuccessMessage('');
      }, 1000); // definir en cuanto tiempo desaparecera la alerta, se mide en ms (3 segundos)
    }
  }, [successMessage]);
  
  const handleOpenModal = () => {
    setNewUser({ name: '', email: '', role: 'admin', description: '', profile_picture: defaultProfilePicture, password: '' });
    setIsModalOpen(true);
    setErrors({});
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const calculateAge = (birthdate) => {
    const diffMs = Date.now() - new Date(birthdate).getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const validateUser = (user, originalUser = {}, isEditing = false) => {
    const validationErrors = {};
    const age = user.birth_date ? calculateAge(user.birth_date) : 0;

    if (!isEditing || (isEditing && user.email && user.email !== originalUser.email)) {
      if (!isValidEmail(user.email)) {
        validationErrors.email = 'El correo que ingresó no es válido, por favor ingrese un correo válido.';
      }
    }

    if ( !isEditing && (user.role === 'beneficiary' && age < 9)) {
      validationErrors.birth_date = 'El beneficiario debe tener al menos 9 años.';
    } else if (user.role !== 'beneficiary' && age < 18) {
      validationErrors.birth_date = 'Los usuarios deben tener al menos 18 años.';
    }

    if (!isEditing || (isEditing && user.password && user.password.trim() !== "")) {
      if (!user.password || user.password.length < 8) {
        validationErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
      }
    }

    if (!isEditing && user.description && user.description.length < 10) {
      validationErrors.description = 'La descripción debe tener mínimo 10 caracteres';
    }

    return validationErrors;
  };

  const handleAddUser = () => {
    const { name, email, password, description, role, birth_date, profile_picture } = newUser;

    const missingFields = [];
    if (!name) missingFields.push('Nombre');
    if (!email) missingFields.push('Correo Electrónico');
    if (!password) missingFields.push('Contraseña');
    if (!description) missingFields.push('Descripción');
    if (!role) missingFields.push('Rol');
    if (!birth_date) missingFields.push('Fecha de Nacimiento');
    if (!profile_picture) missingFields.push('Foto de Perfil');

    if (missingFields.length > 0) {
      setMessage(`Por favor, completa los siguientes campos: ${missingFields.join(', ')}`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const validationErrors = validateUser(newUser, {}, false);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      setMessage(firstError);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const userData = { name, email, birth_date, role, description, password, profile_picture: profile_picture || defaultProfilePicture };

    axios.post('http://localhost:5000/usuarios', userData)
      .then(response => {
        const createdUser = response.data;
        setData([...data, createdUser]);
        handleCloseModal();
        setSuccessMessage('Usuario agregado exitosamente.');
      })
      .catch(error => {
        if (error.response && error.response.status === 409) {
          setMessage('El correo utilizado ya está registrado');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
        } else {
          setMessage('Error al agregar usuario, intente más tarde.');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
        }
      });
  };

  const handleEditUser = () => {
    const validationErrors = validateUser(newUser, {}, false);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      const firstError = Object.values(validationErrors)[0];

      setMessage(firstError);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const updatedUser = {
      name: editUser.name,
      email: editUser.email,
      role: editUser.role,
      description: editUser.description,
      ...(editUser.password ? { password: editUser.password } : {})
    };

    axios.put(`http://localhost:5000/usuarios/${editUser.id}`, updatedUser)
      .then(response => {
        axios.get('http://localhost:5000/usuarios')
          .then(response => {
            setData(response.data);
          })
          .catch(error => {
            console.error('Error fetching users:', error);
          });
        handleCloseEditModal();
        setSuccessMessage('Usuario editado exitosamente.'); // Mostrar mensaje de éxito
      })
      .catch(error => {
        setMessage(`Error al actualizar usuario, intente más tarde.`);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return;
      });
  };

  const handleOpenEditModal = (user) => {
    setEditUser({
      ...user,
      password: ''
    });
    setOriginalUser({ ...user });
    setIsEditModalOpen(true);
    setErrors({});
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setErrors({});
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/usuarios/${id}`)
      .then(() => {
        setData(data.filter(user => user.id !== id));
        setSuccessMessage('Usuario eliminado exitosamente.'); // Mostrar mensaje de éxito
      })
      .catch(error => {
        let errorMessage = 'Error al eliminar usuario, intente más tarde.';
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        setMessage(errorMessage);
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
  };

  const handleDeleteClick = (id) => {
    setCurrentId(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (currentId) {
      handleDelete(currentId);
    }
    setIsDeleteConfirmOpen(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = data.filter((user) => {
    const matchesRole = filtroRol ? user.role === filtroRol : true;
    const matchesSearchTerm = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearchTerm;
  });

  return (
    <>
      <div className="w-full px-6 py-0.1 mx-auto mt-2">
        <Typography variant="h3" align="center" color="primary" gutterBottom>
          Usuarios
        </Typography>
        <div className="flex justify-between mb-4 space-x-4">
        {/* Filtro por rol */}
          <div className="flex space-x-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <label htmlFor="filtroRol" className="text-white mr-2">
              Filtrar por Rol:
            </label>
            <motion.select
              id="filtroRol"
              className="p-2 rounded bg-gray-800 text-white border border-gray-700"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <option value="">Todos</option>
              <option value="admin">Administrador</option>
              <option value="coordinator">Coordinador</option>
              <option value="volunteer">Voluntario</option>
              <option value="donor">Donante</option>
              <option value="beneficiary">Beneficiario</option>
            </motion.select>
          </motion.div>
  
          <TextField
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
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Typography variant="body1" color="primary" className="mr-2">
                Ver en tarjetas
              </Typography>
              <Switch
                checked={mostrarCards}
                onChange={() => setMostrarCards(!mostrarCards)}
                color="primary"
              />
            </div>
  
            <motion.button
              className="bg-green-500 text-white p-2 rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleOpenModal}
            >
              <FaPlus />
            </motion.button>
          </div>
        </div>
  
        {/* Mostrar contenido dependiendo del estado del switch */}
        {mostrarCards ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((item) => (
              <motion.div
                key={item.id}
                className="bg-gray-800 text-white p-6 rounded-lg shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-center items-center">
                  <img
                    src={`http://localhost:5000${item.profile_picture}` || defaultProfilePicture}
                    alt={item.name}
                    className="h-32 w-32 object-cover rounded-full mb-4"
                  />
                </div>
                <Typography variant="h5" gutterBottom className="flex justify-center">
                  {item.name}
                </Typography>
                <Typography variant="body1" gutterBottom className="flex justify-center">
                  {item.role}
                </Typography>
                <Typography variant="body2" gutterBottom className="flex justify-center">
                  {item.email}
                </Typography>
                <Typography variant="body2" gutterBottom className="flex justify-center">
                  {item.birth_date}
                </Typography>
                <Typography variant="body2" className="flex justify-center">
                  {item.description}
                </Typography>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.table className="w-full bg-gray-800 text-white rounded-lg shadow-md">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4">Nombre</th>
                <th className="p-4">Correo</th>
                <th className="p-4">Fecha de nacimiento</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Descripción</th>
                <th className="p-4">Fecha Creación</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <motion.tbody layout>
              {filteredData.map((item) => (
                <motion.tr key={item.id} className="border-b border-gray-700">
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.email}</td>
                  <td className="p-4">{item.birth_date}</td>
                  <td className="p-4">{item.role}</td>
                  <td className="p-4">{truncateDescription(item.description)}</td>
                  <td className="p-4">{item.created_at}</td>
                  <td className="p-4 flex space-x-4">
                    <motion.button
                      className="bg-blue-500 text-white p-2 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleOpenEditModal(item)}
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      className="bg-red-500 text-white p-2 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteClick(item.id)}
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
  

      {/* Modal para añadir usuario */}
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
              <h2 className="text-white text-2xl font-bold mb-4">Agregar Nuevo Usuario</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholder="Nombre"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholder="Correo"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <DatePicker
                  selected={newUser.birth_date}
                  onChange={(date) => setNewUser({ ...newUser, birth_date: date })}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Fecha de nacimiento"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                />
                <select
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="admin">Administrador</option>
                  <option value="coordinator">Coordinador</option>
                  <option value="volunteer">Voluntario</option>
                  <option value="donor">Donante</option>
                  <option value="beneficiary">Beneficiario</option>
                </select>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholder="Descripción"
                  value={newUser.description}
                  onChange={(e) => setNewUser({ ...newUser, description: e.target.value })}
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                    placeholder="Contraseña"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <motion.button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#38a169', scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddUser}>
                  Agregar
                </motion.button>
                <motion.button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#636363', scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseModal}
                >
                  Cancelar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para editar usuario */}
      <AnimatePresence>
        {isEditModalOpen && editUser && (
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
              <h2 className="text-white text-2xl font-bold mb-4">Editar Usuario</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholder="Nombre"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                />
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholder="Correo"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                />
                <select
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                >
                  <option value="admin">Administrador</option>
                  <option value="coordinator">Coordinador</option>
                  <option value="volunteer">Voluntario</option>
                  <option value="donor">Donante</option>
                  <option value="beneficiary">Beneficiario</option>
                </select>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                    placeholder="Nueva Contraseña (opcional)"
                    value={editUser.password || ''}
                    onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                  />
                  <span
                    className="absolute right-2 top-2 cursor-pointer text-gray-500"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded bg-white text-black"
                  placeholder="Descripción"
                  value={editUser.description}
                  onChange={(e) => setEditUser({ ...editUser, description: e.target.value })}
                />
              </div>
              <div className="flex justify-between mt-4">
                <motion.button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#4A90E2', scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleEditUser}
                >
                  Guardar Cambios
                </motion.button>
                <motion.button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#636363', scale: 1.1 }}
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

      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <Dialog
            open={isDeleteConfirmOpen}
            onClose={() => setIsDeleteConfirmOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"¿Estás seguro de eliminar este usuario?"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Esta acción no se puede deshacer. ¿Deseas continuar?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <motion.button
                className="bg-gray-500 text-white px-4 py-2 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancelar
              </motion.button>
              <motion.button
                className="bg-red-500 text-white px-4 py-2 rounded-full"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={confirmDelete}
              >
                Eliminar
              </motion.button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
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
                  <FaCheck size={50} className="text-white" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};

export default CrudUsuarios;
