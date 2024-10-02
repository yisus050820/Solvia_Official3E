import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrashAlt, FaPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

const defaultProfilePicture = 'https://via.placeholder.com/150/000000/FFFFFF/?text=Nuevo+Usuario';

const CrudUsuarios = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'admin', description: '', profile_picture: defaultProfilePicture, password: '' });
  const [editUser, setEditUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [filtroRol, setFiltroRol] = useState('');
  const [errors, setErrors] = useState({});

  // Obtener usuarios al cargar la página
  useEffect(() => {
    axios.get('http://localhost:5000/usuarios')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

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

  const validateUser = (user, originalUser = {}, isEditing = false) => {
    const validationErrors = {};

    if (!user.name.trim() || (isEditing && user.name !== originalUser.name)) {
      if (!user.name.trim()) {
        validationErrors.name = 'El nombre no puede estar vacío.';
      }
    }

    if (!isEditing || (isEditing && user.email && user.email !== originalUser.email)) {
      if (!isValidEmail(user.email)) {
        validationErrors.email = 'El correo no es válido.';
      }
    }

    if (!isEditing || (isEditing && user.password && user.password.trim() !== "")) {
      if (!user.password || user.password.length < 8) {
        validationErrors.password = 'La contraseña debe tener al menos 8 caracteres.';
      }
    }

    if (!isEditing && user.description && user.description.length < 10) {
      validationErrors.description = 'La descripción debe tener al menos 10 caracteres si se proporciona.';
    }

    return validationErrors;
  };

  // Añadir usuario nuevo
  const handleAddUser = () => {
    const validationErrors = validateUser(newUser, {}, false); 
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log("Errores de validación:", validationErrors);
      return;
    }

    const userData = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      description: newUser.description,
      password: newUser.password,
      profile_picture: newUser.profile_picture || defaultProfilePicture
    };

    axios.post('http://localhost:5000/usuarios', userData)
      .then(response => {
        const createdUser = response.data;
        setData([...data, createdUser]); 
        handleCloseModal();
      })
      .catch(error => {
        if (error.response && error.response.status === 409) {
          setErrors({ email: 'Este correo ya está registrado.' });
        } else {
          console.error('Error al añadir usuario:', error);
        }
      });
  };

  // Editar usuario existente
  const handleEditUser = () => {
    const validationErrors = validateUser(editUser, originalUser, true);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
    })
    .catch(error => {
      console.error('Error al actualizar usuario:', error);
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

  // Eliminar usuario 
  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/usuarios/${id}`)
      .then(() => {
        setData(data.filter(user => user.id !== id));
        setIsDeleteConfirmOpen(false);
        setCurrentId(null);
      })
      .catch(error => {
        console.error('Error deleting user:', error);
      });
  };

  const handleDeleteClick = (id) => {
    setCurrentId(id);  
    setIsDeleteConfirmOpen(true);  
  };

  const confirmDelete = () => {
    handleDelete(currentId);
    setIsDeleteConfirmOpen(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const filteredData = filtroRol ? data.filter((user) => user.role === filtroRol) : data;


  return (
    <>
      <div className="w-full px-6 py-0.1 mx-auto mt-10">
        <div className="flex justify-between mb-4 space-x-4">
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

          <motion.button
            className="bg-green-500 text-white p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOpenModal}
          >
            <FaPlus />
          </motion.button>
        </div>
        {/* Tabla de usuarios */}
        <motion.table className="w-full bg-gray-800 text-white rounded-lg shadow-md">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Correo</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Descripción</th>
              <th className="p-4">Fecha Creación</th> {/* Nueva columna para la fecha de creación */}
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <motion.tbody layout>
            {filteredData.map((item) => (
              <motion.tr key={item.id} className="border-b border-gray-700">
                <td className="p-4">{item.id}</td>
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.email}</td>
                <td className="p-4">{item.role}</td>
                <td className="p-4">{item.description}</td>
                <td className="p-4">{item.created_at}</td> {/* Mostramos la fecha de creación */}
                <td className="p-4 flex space-x-4">
                  <motion.button
                    className="bg-blue-500 text-white p-2 rounded-full"
                    onClick={() => handleOpenEditModal(item)}
                  >
                    <FaEdit />
                  </motion.button>
                  <motion.button
                    className="bg-red-500 text-white p-2 rounded-full"
                    onClick={() => handleDeleteClick(item.id)}  // Abre el diálogo de confirmación
                  >
                    <FaTrashAlt />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </motion.table>
      </div>

      {/* Modal para añadir usuario */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <motion.div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full">
              <h2 className="text-black text-2xl font-bold mb-4">Agregar Nuevo Usuario</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Nombre"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                {errors.name && <p className="text-red-500">{errors.name}</p>}
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Correo"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                {errors.email && <p className="text-red-500">{errors.email}</p>}
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="admin">Administrador</option>
                  <option value="coordinator">Coordinador</option>
                  <option value="volunteer">Voluntario</option>
                  <option value="donor">Donante</option>
                  <option value="beneficiary">Beneficiario</option>
                </select>
                {errors.role && <p className="text-red-500">{errors.role}</p>}
                <textarea
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Descripción"
                  value={newUser.description}
                  onChange={(e) => setNewUser({ ...newUser, description: e.target.value })}
                />
                {errors.description && <p className="text-red-500">{errors.description}</p>}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full p-2 border border-gray-300 rounded"
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
                {errors.password && <p className="text-red-500">{errors.password}</p>}
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={handleCloseModal}>Cancelar</button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAddUser}>Agregar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para editar usuario*/}
      <AnimatePresence>
        {isEditModalOpen && editUser && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <motion.div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full">
              <h2 className="text-black text-2xl font-bold mb-4">Editar Usuario</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Nombre"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                />
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Correo"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                />
                <select
                  className="w-full p-2 border border-gray-300 rounded"
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
                    className="w-full p-2 border border-gray-300 rounded"
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
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Descripción"
                  value={editUser.description}
                  onChange={(e) => setEditUser({ ...editUser, description: e.target.value })}
                />
              </div>
              <div className="flex justify-between mt-4">
                <motion.button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#4A90E2' }}
                  onClick={handleEditUser}
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
                onClick={confirmDelete}  // Llama a la función confirmDelete
              >
                Eliminar
              </motion.button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default CrudUsuarios;