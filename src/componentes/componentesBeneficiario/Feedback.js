import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Typography } from '@mui/material';

const ProgramCard = ({ title, description, participants, donations, status, imageUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setRating(0);
    setFeedback('');
  };

  const handleCloseModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const handleRatingChange = (event) => {
    setRating(event.target.value);
  };

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
  };

  const handleSubmitFeedback = () => {
    console.log(`Feedback enviado para ${title}:`);
    console.log(`Calificación: ${rating}`);
    console.log(`Comentario: ${feedback}`);
    
    resetForm();
    setIsModalOpen(false);
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

  return (
    <>
      <motion.div 
        className="max-w-sm bg-gray-800 rounded-xl shadow-lg overflow-hidden m-4"
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}   
      >
        <img
          className="w-full h-48 object-cover"
          src={imageUrl ? `http://localhost:5000${imageUrl}` : "https://via.placeholder.com/150"}
          alt={title}
        />
        <div className="p-4">
          <h2 className="text-white text-xl font-bold">{title}</h2>
          <div className="flex items-center mt-2">
            <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(status)}`}></span>
            <span className="ml-2 text-gray-400 capitalize">{status}</span>
          </div>
          <p className="text-gray-400 mt-2">
            {description.length > 100 ? `${description.substring(0, 100)}...` : description}
          </p>
          <div className="mt-4">
            <span className="text-green-400">Participantes: {participants}</span>
          </div>
          <div className="mt-2">
            <span className="text-green-600">Donaciones: ${donations}</span>
          </div>
          <div className="flex mt-4 space-x-4">
            <motion.button 
              className="bg-gray-700 text-white px-4 py-2 rounded"
              whileHover={{ backgroundColor: '#636363' }}
              onClick={handleOpenModal}
            >
              Dar Feedback
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
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
              <h2 className="text-2xl font-bold mb-4">Feedback para {title}</h2>
              <p className="text-gray-400">{description}</p>
              <div className="mb-4">
                <label className="block text-gray-300 font-bold mb-2">
                  Calificación (1 a 10):
                </label>
                <input 
                  type="number" 
                  value={rating} 
                  onChange={handleRatingChange} 
                  min="1" 
                  max="10" 
                  className="w-full p-2 border border-gray-500 rounded bg-white text-black"
                  placeholder="Calificación"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-300 font-bold mb-2">
                  Comentarios:
                </label>
                <textarea 
                  value={feedback} 
                  onChange={handleFeedbackChange} 
                  className="w-full p-2 border border-gray-500 rounded bg-white text-black" 
                  rows="4" 
                  placeholder="Escribe tu comentario aquí..."
                />
              </div>
              
              <div className="flex justify-between mt-4">
                <motion.button 
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#636363' }}
                  onClick={handleCloseModal}
                >
                  Cancelar
                </motion.button>
                
                <motion.button 
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#4A90E2' }}
                  onClick={handleSubmitFeedback}
                >
                  Enviar Feedback
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Calificar = () => {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/programas');
        const programData = await Promise.all(
          response.data.map(async (program) => {
            const participantsRes = await axios.get(`http://localhost:5000/programas/beneficiaries/count/${program.id}`);
            const donationsRes = await axios.get(`http://localhost:5000/programas/expenses/total/${program.id}`);
            return {
              ...program,
              participants: participantsRes.data.count,
              donations: donationsRes.data.total,
              imageUrl: program.program_image, // Imagen del programa desde el backend
            };
          })
        );        
        setPrograms(programData);
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <div className="mt-2"> {/* Ajusta el margen superior */}
      {/* Título de la sección */}
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Feedback
      </Typography>
    <div className="flex justify-center flex-wrap">
      {programs.map((program) => (
        <ProgramCard
          key={program.id}
          title={program.name}
          description={program.description}
          participants={program.participants}
          donations={program.donations}
          status={program.status}
          imageUrl={program.imageUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default Calificar;
