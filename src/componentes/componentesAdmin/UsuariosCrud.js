import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrashAlt, FaPlus, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar, Alert, Switch, TextField, Avatar } from '@mui/material';
import { ReceiptEuroIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const defaultProfilePicture = 'https://via.placeholder.com/150/000000/FFFFFF/?text=Nuevo+Usuario';

const CrudUsuarios = () => {
  const [user, setUser] = useState([]);
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
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda}
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleLogout = () => {
    localStorage.clear(); // Limpiar datos almacenados
    delete axios.defaults.headers.common['Authorization']; // Limpiar encabezados globales
    window.location.href = '/index'; // Redirigir a la página de inicio
  };

  // Variantes de animación para la palomita
  const checkmarkVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: { opacity: 1, pathLength: 1 },
  };

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }

    axios.get('http://localhost:5000/usuarios')
      .then(response => {
        if (Array.isArray(response.data)) {
          setUser(response.data);
        } else {
          console.error('La respuesta de la API no es un array:', response.data);
        }
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
    setNewUser({ name: '', email: '', birthdate: null, role: 'admin', description: '', profile_picture: defaultProfilePicture, password: '' });
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
    const trimmedName = user.name.trim();

    if (trimmedName.length < 3) {
      validationErrors.name = 'En nombre debe de tener un minimo de 3 caracteres';
    }

    if (!isEditing || (isEditing && user.email && user.email !== originalUser.email)) {
      if (!isValidEmail(user.email)) {
        validationErrors.email = 'El correo que ingresó no es válido, por favor ingrese un correo válido.';
      }
    }

    if ((!isEditing && (user.role === 'beneficiary' && age < 9) || isEditing && (user.role === 'beneficiary' && age < 9))) {
      validationErrors.birth_date = 'El beneficiario debe tener al menos 9 años.';
    } else if (!isEditing && user.role !== 'beneficiary' && age < 18 || isEditing && user.role !== 'beneficiary' && age < 18) {
      validationErrors.birth_date = 'Los usuarios deben tener al menos 18 años.';
    } 
    
    if (!isEditing && age > 100 || isEditing && age > 100) {
      validationErrors.birth_date = 'Por favor introduzca una fecha de nacimiento valida.';
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
    const { name, email, birth_date, password, description, role, profile_picture } = newUser;

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
        setUser([...user, response.data]); // Agrega el nuevo usuario al estado `user`
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
    const validationErrors = validateUser(editUser, originalUser, true);

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
      birth_date: editUser.birth_date ? format(editUser.birth_date, 'yyyy-MM-dd') : null,
      role: editUser.role,
      description: editUser.description,
      ...(editUser.password ? { password: editUser.password } : {})
    };

    axios.put(`http://localhost:5000/usuarios/${editUser.id}`, updatedUser)
      .then(response => {
        setUser(user.map(user => user.id === editUser.id ? response.data : user));
        handleCloseEditModal();
        setSuccessMessage('Usuario editado exitosamente.');
      })
      .catch(error => {
        setMessage('Error al actualizar usuario, intente más tarde.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      });
  };

  const handleOpenEditModal = (user) => {
    setEditUser({
      ...user,
      birth_date: user.birth_date ? new Date(user.birth_date) : null,
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
        setUser(user.filter(user => user.id !== id));
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
    setSearchQuery(e.target.value.toLowerCase());
  };

  const sortedUser = [...user].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "email") return a.email.localeCompare(b.email);
    if (sortBy === "birth_date") return new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime();
    if (sortBy === "role") return a.role.localeCompare(b.role);
    if (sortBy === "description") return a.description.localeCompare(b.description);
    if (sortBy === "created_at") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return 0;
  });

  const filteredUser = sortedUser.filter((user) => {
    const matchesSearchQuery = (
      user.name.toLowerCase().includes(searchQuery) ||
      user.email.toLowerCase().includes(searchQuery) ||
      (user.birth_date && user.birth_date.toLowerCase().includes(searchQuery)) ||
      user.role.toLowerCase().includes(searchQuery) ||
      (user.description && user.description.toLowerCase().includes(searchQuery)) ||
      (user.created_at && user.created_at.toLowerCase().includes(searchQuery))
    );

    const matchesRole = filtroRol === '' || user.role === filtroRol; // Condición de filtro de rol

    return matchesSearchQuery && matchesRole;
  });

  return (
    <>
      <button
        onClick={handleLogout}
        style={{
          position: 'fixed', // El botón se mantiene fijo en la parte superior derecha
          top: '20px', // Ajusta la distancia desde el borde superior
          right: '20px', // Ajusta la distancia desde el borde derecho
          backgroundColor: '#ff0000', // Color rojo brillante
          color: 'white', // Color del texto
          border: 'none',
          padding: '10px 15px',
          borderRadius: '5px',
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)', // Sombra para visibilidad
          zIndex: 9999, // Asegura que el botón se vea por encima de otros elementos
        }}
      >
        Cerrar sesión
      </button>

      <div className="w-full px-6 py-0.1 mx-auto mt-2">
        <Typography variant="h3" align="center" color="primary" gutterBottom>
          Usuarios
        </Typography>
      </div>
      <div className="w-full px-6 py-0.1 mx-auto mt-2">
        <div className="flex justify-between mb-4 space-x-4">
          {/* Filtro por rol */}
          <div className="flex space-x-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <label htmlFor="filtroRol" className="text-black mr-2">
                Filtrar por Rol:
              </label>
              <motion.select
                id="filtroRol"
                className="p-2 rounded bg-[#EEE5E9] text-[#383D3B] border border-[#7C7C7C]"
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
                backgroundColor: '#EEE5E9',          // Fondo claro
                color: '#383D3B',                     // Texto oscuro
                borderRadius: '5px',
                '& .MuiOutlinedInput-root': {
                  height: '36px',                   // Altura total del input
                  fontSize: '0.9rem',               // Tamaño del texto
                  '& input': {
                    color: '#383D3B',               // Texto oscuro
                    padding: '8px 14px',            // Ajusta el padding interno
                  },
                  '& fieldset': {
                    borderColor: '#7C7C7C',            // Color del borde gris oscuro
                  },
                  '&:hover fieldset': {
                    borderColor: '#383D3B',            // Borde oscuro al pasar el cursor
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#7C7C7C',                    // Etiqueta gris
                  fontSize: '0.9rem',
                  top: '-6px',                      // Ajusta la posición de la etiqueta
                },
              }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Typography variant="body1" sx={{ color: '#383D3B' }} className="mr-2">
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

            <motion.button
              className="bg-[#0097A7] text-[#EEE5E9] p-2 rounded-full"  // Botón de asignación
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
          <div className="flex justify-center flex-wrap mt-2">
            {Array.isArray(filteredUser) ? filteredUser.map((item) => (
              <motion.div
                key={item.id}
                className="max-w-sm rounded-xl shadow-lg overflow-hidden m-2"
                style={{ backgroundColor: '#383D3B' }} // Fondo oscuro para las tarjetas
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Contenedor centrado para la imagen */}
                <div className="flex justify-center mt-4">  {/* Agregado un margin top para dar espacio */}
                  <Avatar
                    src={`http://localhost:5000${item.profile_picture}?${new Date().getTime()}`}
                    alt={item.name}
                    sx={{
                      width: 160,  // Imagen más grande
                      height: 160, // Imagen más grande
                      objectFit: 'cover',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </div>

                <div className="p-4">
                  <h2 className="text-xl font-bold" style={{ color: '#EEE5E9' }}>
                    {item.name}
                  </h2>
                  <div className="flex items-center mt-2">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${item.role === 'active' ? 'bg-green-500' : 'bg-red-500'}`}
                    ></span>
                    <span className="ml-2 capitalize" style={{ color: '#7C7C7C' }}>
                      {item.role}
                    </span>
                  </div>
                  <p className="mt-2" style={{ color: 'white' }}>
                    {item.description && item.description.length > 100
                      ? `${item.description.substring(0, 100)}...`
                      : item.description}
                  </p>

                  <div className="mt-2">
                    <span style={{ color: '#4CAF50' }}>
                      {item.email}
                    </span>
                  </div>

                  <div className="flex mt-4 justify-between">


                    <div className="flex space-x-2">
                      {/* Botón de editar */}
                      <motion.button
                        className="p-2 rounded-full"
                        style={{
                          backgroundColor: '#4A90E2',
                          color: '#EEE5E9',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleOpenEditModal(item)}
                      >
                        <FaEdit />
                      </motion.button>

                      {/* Botón de eliminar */}
                      <motion.button
                        className="p-2 rounded-full"
                        style={{
                          backgroundColor: '#E63946',
                          color: '#EEE5E9',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        <FaTrashAlt />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : <p>No hay usuarios disponibles</p>}
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
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <motion.tbody layout>
              {Array.isArray(filteredUser) ? filteredUser.map((item) => (
                <motion.tr
                  key={item.id}
                  className="border-b"
                  style={{ borderColor: '#7C7C7C' }}
                >
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.email}</td>
                  <td className="p-4">{item.birth_date}</td>
                  <td className="p-4">{item.role}</td>
                  <td className="p-4">{truncateDescription(item.description)}</td>
                  <td className="p-4">{item.created_at}</td>
                  <td className="p-4 flex space-x-4">
                    <motion.button
                      className="p-2 rounded-full"
                      style={{
                        backgroundColor: '#4A90E2',
                        color: '#EEE5E9',
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleOpenEditModal(item)}
                    >
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      className="p-2 rounded-full"
                      style={{
                        backgroundColor: '#E63946',
                        color: '#EEE5E9',
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteClick(item.id)}
                    >
                      <FaTrashAlt />
                    </motion.button>
                  </td>
                </motion.tr>
              )) : <p>No hay usuarios disponibles</p>}
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
              className="p-8 rounded-xl shadow-lg max-w-lg w-full"
              style={{ backgroundColor: '#383D3B' }} // Fondo oscuro del modal
              initial={{ y: "-100vh" }}
              animate={{ y: "0" }}
              exit={{ y: "-100vh" }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#EEE5E9' }}>
                Agregar Nuevo Usuario
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  style={{
                    borderColor: '#7C7C7C',
                    backgroundColor: '#EEE5E9',
                    color: '#383D3B',
                  }}
                  placeholder="Nombre"
                  value={newUser.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z\s]*$/.test(value)) {
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                  }}
                />
                <input
                  type="email"
                  className="w-full p-2 border rounded"
                  style={{
                    borderColor: '#7C7C7C',
                    backgroundColor: '#EEE5E9',
                    color: '#383D3B',
                  }}
                  placeholder="Correo"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <DatePicker
                  selected={newUser.birth_date}
                  onChange={(date) => setNewUser({ ...newUser, birth_date: date })}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Fecha de nacimiento"
                  className="w-full p-2 border rounded bg-gray-200 text-black"
                  style={{
                    borderColor: '#7C7C7C',
                    backgroundColor: '#EEE5E9',
                    color: 'black',
                  }}
                  onKeyDown={(e) => {
                    // Permitir solo teclas numéricas (0-9) y el guion (-)
                    if (!/[0-9\-]/.test(e.key) && e.key !== 'Backspace') {
                      e.preventDefault(); // Bloquea cualquier tecla que no sea número o guion
                    }
                  }}
                />
                <select
                  className="w-full p-2 border rounded"
                  style={{
                    borderColor: '#7C7C7C',
                    backgroundColor: '#EEE5E9',
                    color: '#383D3B',
                  }}
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
                  className="w-full p-2 border rounded"
                  placeholder="Descripción"
                  style={{
                    borderColor: '#7C7C7C',
                    backgroundColor: '#EEE5E9',
                    color: '#383D3B',
                  }}
                  value={newUser.description}
                  onChange={(e) => setNewUser({ ...newUser, description: e.target.value })}
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full p-2 border rounded"
                    placeholder="Contraseña"
                    style={{
                      borderColor: '#7C7C7C',
                      backgroundColor: '#EEE5E9',
                      color: '#383D3B',
                    }}
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
                  onClick={handleAddUser}
                >
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
              className="p-8 rounded-xl shadow-lg max-w-lg w-full"
              style={{ backgroundColor: '#383D3B' }} // Fondo oscuro del modal
              initial={{ y: "-100vh" }}
              animate={{ y: "0" }}
              exit={{ y: "-100vh" }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#EEE5E9' }}>
                Editar Usuario
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  style={{
                    borderColor: '#7C7C7C',
                    backgroundColor: '#EEE5E9',
                    color: '#383D3B',
                  }}
                  placeholder="Nombre"
                  value={editUser.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z\s]*$/.test(value)) {
                      setEditUser({ ...editUser, name: e.target.value });
                    }
                  }}
                />
                <input
                  type="email"
                  className="w-full p-2 border rounded"
                  style={{
                    borderColor: '#7C7C7C',
                    backgroundColor: '#EEE5E9',
                    color: '#383D3B',
                  }}
                  placeholder="Correo"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                />
                <DatePicker
                  selected={editUser.birth_date}
                  onChange={(date) => setEditUser({ ...editUser, birth_date: date })}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Fecha de nacimiento"
                  className="w-full p-2 border rounded bg-gray-200 text-black"
                  style={{
                    borderColor: '#7C7C7C',
                    backgroundColor: '#EEE5E9',
                    color: '#383D3B',
                  }}
                  onKeyDown={(e) => {
                    if (!/[0-9\-]/.test(e.key) && e.key !== 'Backspace') {
                      e.preventDefault();
                    }
                  }}
                />
                <select
                  className="w-full p-2 border rounded"
                  style={{
                    borderColor: '#7C7C7C',
                    backgroundColor: '#EEE5E9',
                    color: '#383D3B',
                  }}
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
                    className="w-full p-2 border rounded"
                    style={{
                      borderColor: '#7C7C7C',
                      backgroundColor: '#EEE5E9',
                      color: '#383D3B',
                    }}
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
                  className="w-full p-2 border rounded"
                  style={{
                    borderColor: '#7C7C7C',
                    backgroundColor: '#EEE5E9',
                    color: '#383D3B',
                  }}
                  placeholder="Descripción"
                  value={editUser.description}
                  onChange={(e) => setEditUser({ ...editUser, description: e.target.value })}
                />
              </div>
              <div className="flex justify-between mt-4">
                <motion.button
                  className="px-4 py-2 rounded"
                  style={{ backgroundColor: '#0097A7', color: '#EEE5E9' }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleEditUser}
                >
                  Guardar Cambios
                </motion.button>
                <motion.button
                  className="px-4 py-2 rounded"
                  style={{ backgroundColor: '#E63946', color: '#EEE5E9' }}
                  whileHover={{ scale: 1.1 }}
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

      {/* Confirmación de eliminar */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: '#383D3B', // Fondo oscuro
            color: '#EEE5E9', // Texto claro
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">
          {"¿Estás seguro de eliminar este usuario?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: '#EEE5E9' }}>
            Esta acción no se puede deshacer. ¿Deseas continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <motion.button
            className="bg-[#7C7C7C] text-[#EEE5E9] px-4 py-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsDeleteConfirmOpen(false)} // Cierra el diálogo
          >
            Cancelar
          </motion.button>
          <motion.button
            className="bg-red-500 text-white px-4 py-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={confirmDelete} // Ejecuta la función para confirmar la eliminación
          >
            Eliminar
          </motion.button>
        </DialogActions>
      </Dialog>
      {/* Snackbar para errores */}
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
            transition={{ duration: 0.2, ease: "easeIn" }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              exit={{ y: 50 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="p-6 rounded-xl shadow-lg"
              style={{
                backgroundColor: '#003f5c', // Fondo azul oscuro
                color: '#ffffff', // Texto blanco puro
              }}
            >
              <h2
                style={{
                  color: '#ffffff', // Texto blanco puro
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                {successMessage}
              </h2>
              <div className="flex justify-center items-center">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={checkmarkVariants}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="flex justify-center items-center"
                  style={{
                    borderRadius: '50%', // Hace que sea un círculo
                    backgroundColor: '#0097A7', // Aqua oscuro
                    width: '80px', // Tamaño del círculo
                    height: '80px', // Tamaño del círculo
                    display: 'flex', // Para alinear el contenido
                    justifyContent: 'center', // Centra horizontalmente
                    alignItems: 'center', // Centra verticalmente
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra suave
                  }}
                >
                  <FaCheck size={50} style={{ color: '#ffffff' }} /> {/* Palomita blanca */}
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
