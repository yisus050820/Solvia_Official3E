import React, { useState } from 'react';
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
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Coordinador', description: '', profile_picture: defaultProfilePicture, password: '' });
  const [editUser, setEditUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [filtroRol, setFiltroRol] = useState('');


  const handleOpenModal = () => {
    setNewUser({ name: '', email: '', role: 'Coordinador', description: '', profile_picture: defaultProfilePicture, password: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenEditModal = (user) => {
    setEditUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleDelete = (id) => {
    setIsDeleteConfirmOpen(true);
    setCurrentId(id);
  };

  const confirmDelete = () => {
    setData((prevData) =>
      prevData.filter((item) => item.id !== currentId)
    );
    setIsDeleteConfirmOpen(false);
  };

  const handleAddUser = () => {
    const newUserId = data.length ? Math.max(...data.map((u) => u.id)) + 1 : 1;
    setData([...data, { ...newUser, id: newUserId }]);
    handleCloseModal();
  };

  const handleEditUser = () => {
    setData((prevData) =>
      prevData.map((item) => (item.id === editUser.id ? editUser : item))
    );
    handleCloseEditModal();
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
              <option value="Administrador">Administrador</option>
              <option value="Coordinador">Coordinador</option>
              <option value="Voluntario">Voluntario</option>
              <option value="Donante">Donante</option>
              <option value="Beneficiario">Beneficiario</option>
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

        <motion.table
          className="w-full bg-gray-800 text-white rounded-lg shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Correo</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Descripción</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <motion.tbody layout>
            {filteredData.map((item) => (
              <motion.tr
                key={item.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="border-b border-gray-700"
              >
                <td className="p-4">{item.id}</td>
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.email}</td>
                <td className="p-4">{item.role}</td>
                <td className="p-4">{item.description}</td>
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
                    onClick={() => handleDelete(item.id)}
                  >
                    <FaTrashAlt />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </motion.table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full"
              initial={{ y: '-100vh' }}
              animate={{ y: '0' }}
              exit={{ y: '-100vh' }}
            >
              <h2 className="text-black text-2xl font-bold mb-4">Agregar Nuevo Usuario</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Nombre"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Correo"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Coordinador">Coordinador</option>
                  <option value="Voluntario">Voluntario</option>
                  <option value="Donante">Donante</option>
                  <option value="Beneficiario">Beneficiario</option>
                </select>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Contraseña"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
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
                  value={newUser.description}
                  onChange={(e) => setNewUser({ ...newUser, description: e.target.value })}
                />
              </div>
              <div className="flex justify-between mt-4">
                <motion.button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#38a169' }}
                  onClick={handleAddUser}
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

      <AnimatePresence>
        {isEditModalOpen && editUser && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full"
              initial={{ y: '-100vh' }}
              animate={{ y: '0' }}
              exit={{ y: '-100vh' }}
            >
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
                  <option value="Administrador">Administrador</option>
                  <option value="Coordinador">Coordinador</option>
                  <option value="Voluntario">Voluntario</option>
                  <option value="Donante">Donante</option>
                  <option value="Beneficiario">Beneficiario</option>
                </select>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Contraseña"
                    value={editUser.password}
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
                onClick={confirmDelete}
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
