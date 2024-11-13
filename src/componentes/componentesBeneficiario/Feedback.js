import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Typography, Snackbar, Alert } from '@mui/material';
import { FaCheck, FaStar, FaEdit, FaTrashAlt } from 'react-icons/fa';

const ProgramCard = ({ title, description, programId, participants, imageUrl, fetchPrograms, setSuccessMessage, setError, initialFeedback }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [rating, setRating] = useState(initialFeedback ? initialFeedback.score : 0);
  const [feedback, setFeedback] = useState(initialFeedback ? initialFeedback.comment : '');

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setIsViewModalOpen(false);
    setIsDeleteConfirmOpen(false);
    setRating(initialFeedback ? initialFeedback.score : 0);
    setFeedback(initialFeedback ? initialFeedback.comment : '');
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    setIsViewModalOpen(false);
  };

  const handleOpenViewModal = () => {
    setIsViewModalOpen(true);
    setIsEditModalOpen(false);
  };

  const handleDeleteClick = () => setIsDeleteConfirmOpen(true);

  const handleStarClick = (index) => setRating(index + 1);
  const handleFeedbackChange = (event) => setFeedback(event.target.value);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      setError("Por favor ingrese un comentario.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/feedback/${programId}`, { feedback, score: rating }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleCloseModal();
      setSuccessMessage('Feedback enviado exitosamente.');
      fetchPrograms();
    } catch (error) {
      setError('Error al enviar el comentario, intente más tarde.');
    }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/feedback/${programId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleCloseModal();
      setSuccessMessage('Feedback eliminado exitosamente.');
      fetchPrograms();
    } catch (error) {
      setError('Error al eliminar el comentario, intente más tarde.');
    }
  };

  return (
    <>
      {/* Vista de la tarjeta del programa */}
      <motion.div className="max-w-sm bg-gray-800 rounded-xl shadow-lg overflow-hidden m-4"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      >
        <img className="w-full h-48 object-cover" src={imageUrl ? `http://localhost:5000${imageUrl}` : "https://via.placeholder.com/150"} alt={title} />

        <div className="p-4">
          <h2 className="text-white text-xl font-bold">{title}</h2>
          <p className="text-gray-400 mt-2">{description}</p>
          <div className="mt-4">
            <span className="text-green-400">Participantes: {participants}</span>
          </div>
          <motion.button
            className="bg-gray-700 text-white px-4 py-2 rounded mt-4"
            whileHover={{ backgroundColor: '#636363', scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={initialFeedback.hasFeedback ? handleOpenViewModal : handleOpenAddModal}
          >
            Dar Feedback
          </motion.button>
        </div>

      </motion.div>

      {/* Modal para agregar comentario */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="bg-gray-800 text-white p-8 rounded-xl shadow-lg max-w-lg w-full"
            initial={{ y: "-100vh" }}
            animate={{ y: "0" }}
            exit={{ y: "-100vh" }}
            >
              <h2 className="text-2xl font-bold mb-4">Feedback para {title}</h2>
              <p className="text-gray-400 mb-4">{description}</p>
              <div className="flex space-x-1 mb-4">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={index < rating ? "text-yellow-500 cursor-pointer" : "text-gray-500 cursor-pointer"}
                    onClick={() => handleStarClick(index)}
                  />
                ))}
              </div>
              <textarea value={feedback} onChange={handleFeedbackChange} className="w-full p-2 border border-gray-500 rounded bg-white text-black" rows="4" placeholder="Escribe tu comentario aquí..." />
              <div className="flex justify-between mt-4">
                <motion.button className="bg-gray-500 text-white px-4 py-2 rounded" 
                onClick={handleCloseModal}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                >Cancelar
                </motion.button>
                <motion.button 
                className="bg-blue-500 text-white px-4 py-2 rounded" 
                whileHover={{ backgroundColor: '#4A90E2', scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSubmitFeedback}
                >Enviar Feedback
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de vista de un comentario existente */}
      <AnimatePresence>
        {isViewModalOpen && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <motion.div className="bg-white text-black p-8 rounded-xl shadow-lg max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-4">Feedback de {title}</h2>


              {/* Estrellas del rating */}
              <div className="flex space-x-1 mb-4">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={index < initialFeedback.score ? "text-yellow-500" : "text-gray-500"}
                  />
                ))}
              </div>

              {/* Comentario */}
              <div className="mb-4">
                <p>{initialFeedback.comment || "No hay comentario disponible."}</p>
              </div>

              {/* Botones en la parte inferior */}
              <div className="flex justify-between mt-4">
                <motion.button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={handleCloseModal}>Cerrar</motion.button>
                <div className="flex space-x-2">
                  <motion.button className="bg-blue-500 text-white p-2 rounded-full" onClick={handleOpenAddModal}><FaEdit /></motion.button>
                  <motion.button className="bg-red-500 text-white p-2 rounded-full" onClick={handleDeleteClick}><FaTrashAlt /></motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <motion.div className="bg-white text-black p-8 rounded-xl shadow-lg max-w-lg w-full">
              <h2 className="text-lg font-bold mb-4">¿Estás seguro de eliminar este comentario?</h2>
              <p>Esta acción no se puede deshacer. ¿Deseas continuar?</p>
              <div className="flex justify-between mt-4">
                <motion.button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={handleCloseModal}>Cancelar</motion.button>
                <motion.button className="bg-red-500 text-white px-4 py-2 rounded" onClick={confirmDelete}>Eliminar</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const Calificar = () => {
  const [programs, setPrograms] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
      return () => clearTimeout(timer); 
    }
  }, [successMessage]);

  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/feedback/programas', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const programData = await Promise.all(
        response.data.map(async (program) => {
          const participantsRes = await axios.get(`http://localhost:5000/programas/beneficiaries/count/${program.id}`);
          const donationsRes = await axios.get(`http://localhost:5000/programas/expenses/total/${program.id}`);

          return {
            ...program,
            participants: participantsRes.data.count,
            donations: donationsRes.data.total,
            imageUrl: program.program_image,
            feedback: program.feedback || '',  // Asegúrate de asignar feedback
            score: program.score || 0,         // Asegúrate de asignar score
            hasFeedback: !!program.feedback,  // Verifica si tiene feedback
          };
        })
      );

      setPrograms(programData);
    } catch (error) {
      console.error('Error fetching programs:', error);
      setError('Error al pedir los programas.');
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 1000); // Cierra después de 1000 ms
    }
  }, [successMessage]);

  return (
    <div className="mt-2">
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Feedback
      </Typography>
      <div className="flex justify-center flex-wrap">
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            title={program.name}
            description={program.description}
            programId={program.id}
            participants={program.participants}
            imageUrl={program.imageUrl}
            fetchPrograms={fetchPrograms}
            setSuccessMessage={setSuccessMessage}
            setError={setError}
            initialFeedback={{
              comment: program.feedback,
              score: program.score,
            }}
          />
        ))}
      </div>

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

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
              className="bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <h2 className="text-white text-2xl font-bold mb-4">{successMessage}</h2>
              <div className="flex justify-center items-center">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 1, ease: "easeInOut" }}
                  style={{
                    borderRadius: '50%',
                    backgroundColor: '#4CAF50',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <FaCheck size={50} className="text-white" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calificar;
