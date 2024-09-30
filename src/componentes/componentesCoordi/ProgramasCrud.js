import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material'; // Importa Dialog

const CrudProgramas = () => {
const [data, setData] = useState([
    { id: 1, nombre: 'Programa de Alimentación', descripcion: 'Proporcionar alimentos a comunidades necesitadas.', fechaInicio: '2023-01-01', fechaFin: '2023-12-31', objetivos: 'Reducir el hambre', coordinador: 'Juan Pérez' },
    { id: 2, nombre: 'Programa de Educación', descripcion: 'Proporcionar recursos educativos a estudiantes de bajos ingresos.', fechaInicio: '2023-03-01', fechaFin: '2023-09-30', objetivos: 'Mejorar el acceso a la educación', coordinador: 'María García' }
]);

const [isModalOpen, setIsModalOpen] = useState(false);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
const [currentId, setCurrentId] = useState(null);
const [newProgram, setNewProgram] = useState({ nombre: '', descripcion: '', fechaInicio: null, fechaFin: null, objetivos: '', coordinador: '' });
const [editProgram, setEditProgram] = useState(null);

  // Limitar la descripción en la tabla a 50 caracteres
const truncateDescription = (description) => {
    return description.length > 50 ? description.slice(0, 50) + '...' : description;
};

  // Formatear fecha para MySQL (YYYY-MM-DD)
const formatDateForMySQL = (date) => {
    return date ? new Date(date).toISOString().split('T')[0] : '';
};

const handleOpenModal = () => {
    setNewProgram({ nombre: '', descripcion: '', fechaInicio: null, fechaFin: null, objetivos: '', coordinador: '' });
    setIsModalOpen(true);
};

const handleCloseModal = () => {
    setIsModalOpen(false);
};

const handleOpenEditModal = (program) => {
    setEditProgram(program);
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
    setData(data.filter(item => item.id !== currentId));
    setIsDeleteConfirmOpen(false);
};
const handleAddProgram = () => {
    const newProgramId = data.length ? Math.max(...data.map(u => u.id)) + 1 : 1;
    setData([...data, { ...newProgram, id: newProgramId, fechaInicio: formatDateForMySQL(newProgram.fechaInicio), fechaFin: formatDateForMySQL(newProgram.fechaFin) }]);
    handleCloseModal();
};

const handleEditProgram = () => {
    setData(data.map(item => (item.id === editProgram.id ? { ...editProgram, fechaInicio: formatDateForMySQL(editProgram.fechaInicio), fechaFin: formatDateForMySQL(editProgram.fechaFin) } : item)));
    handleCloseEditModal();
};

return (
    <>
    <div className="w-full px-6 py-0.1 mx-auto mt-10">
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

        <table className="w-full bg-gray-800 text-white rounded-lg shadow-md">
        <thead className="bg-gray-700">
            <tr>
            <th className="p-4">ID</th>
            <th className="p-4">Nombre</th>
            <th className="p-4">Descripción</th>
            <th className="p-4">Fecha Inicio</th>
            <th className="p-4">Fecha Fin</th>
            <th className="p-4">Objetivos</th>
            <th className="p-4">Coordinador a Cargo</th>
            <th className="p-4">Acciones</th>
            </tr>
        </thead>
        <tbody className="bg-gray-900">
            {data.map((item) => (
            <tr key={item.id} className="border-b border-gray-700">
                <td className="p-4">{item.id}</td>
                <td className="p-4">{item.nombre}</td>
                <td className="p-4">{truncateDescription(item.descripcion)}</td> {/* Limitar la descripción */}
                <td className="p-4">{item.fechaInicio}</td>
                <td className="p-4">{item.fechaFin}</td>
                <td className="p-4">{item.objetivos}</td>
                <td className="p-4">{item.coordinador}</td>
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
            </tr>
            ))}
        </tbody>
        </table>
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
            className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full"
            initial={{ y: "-100vh" }}
            animate={{ y: "0" }}
            exit={{ y: "-100vh" }}
            >
            <h2 className="text-black text-2xl font-bold mb-4">Agregar Nuevo Programa</h2>
            <div className="space-y-4">
                <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Nombre"
                value={newProgram.nombre}
                onChange={(e) => setNewProgram({ ...newProgram, nombre: e.target.value })}
                />
                <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Descripción"
                value={newProgram.descripcion}
                onChange={(e) => setNewProgram({ ...newProgram, descripcion: e.target.value })}
                />
                <DatePicker
                selected={newProgram.fechaInicio}
                onChange={(date) => setNewProgram({ ...newProgram, fechaInicio: date })}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border border-gray-300 rounded"
                placeholderText="Fecha de Inicio"
                />
                <DatePicker
                selected={newProgram.fechaFin}
                onChange={(date) => setNewProgram({ ...newProgram, fechaFin: date })}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border border-gray-300 rounded"
                placeholderText="Fecha Final"
                />
                <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Objetivos"
                value={newProgram.objetivos}
                onChange={(e) => setNewProgram({ ...newProgram, objetivos: e.target.value })}
                />
                <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Coordinador a Cargo"
                value={newProgram.coordinador}
                onChange={(e) => setNewProgram({ ...newProgram, coordinador: e.target.value })}
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
            className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full"
            initial={{ y: "-100vh" }}
            animate={{ y: "0" }}
            exit={{ y: "-100vh" }}
            >
            <h2 className="text-black text-2xl font-bold mb-4">Editar Programa</h2>
            <div className="space-y-4">
                <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Nombre"
                value={editProgram.nombre}
                onChange={(e) => setEditProgram({ ...editProgram, nombre: e.target.value })}
                />
                <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Descripción"
                value={editProgram.descripcion}
                onChange={(e) => setEditProgram({ ...editProgram, descripcion: e.target.value })}
                />
                <DatePicker
                selected={editProgram.fechaInicio}
                onChange={(date) => setEditProgram({ ...editProgram, fechaInicio: date })}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border border-gray-300 rounded"
                placeholderText="Fecha de Inicio"
                />
                <DatePicker
                selected={editProgram.fechaFin}
                onChange={(date) => setEditProgram({ ...editProgram, fechaFin: date })}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border border-gray-300 rounded"
                placeholderText="Fecha Final"
                />
                <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Objetivos"
                value={editProgram.objetivos}
                onChange={(e) => setEditProgram({ ...editProgram, objetivos: e.target.value })}
                />
                <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Coordinador a Cargo"
                value={editProgram.coordinador}
                onChange={(e) => setEditProgram({ ...editProgram, coordinador: e.target.value })}
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

      {/* Confirmación de eliminar */}
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
            onClick={confirmDelete}
        >
            Eliminar
        </motion.button>
        </DialogActions>
    </Dialog>
    </>
);
};

export default CrudProgramas;
