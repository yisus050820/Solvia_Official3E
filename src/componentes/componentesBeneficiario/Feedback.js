import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProgramCard = ({ title, description, participants, donations }) => {
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
    resetForm(); // Restablecer el formulario cuando se cierra el modal
    setIsModalOpen(false);
  };

  const handleRatingChange = (event) => {
    setRating(event.target.value);
  };

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
  };

  const handleSubmitFeedback = () => {
    // Aquí iría la llamada al backend para enviar el feedback
    // Ejemplo: fetch('/api/feedback', { method: 'POST', body: JSON.stringify({ title, rating, feedback }) })
    console.log(`Feedback enviado para ${title}:`);
    console.log(`Calificación: ${rating}`);
    console.log(`Comentario: ${feedback}`);
    
    // Cerrar el modal y reiniciar el formulario
    resetForm();
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Tarjeta del programa */}
      <motion.div 
        className="max-w-sm bg-gray-800 rounded-xl shadow-lg overflow-hidden m-4"
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}   
      >
        {/* Imagen del programa */}
        <img
          className="w-full h-48 object-cover"
          src="https://via.placeholder.com/150"
          alt={title}
        />
        {/* Contenido principal de la tarjeta */}
        <div className="p-4">
          <h2 className="text-white text-xl font-bold">{title}</h2>
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
            {/* Botón para abrir la ventana emergente */}
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

      {/* Ventana emergente */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"  // z-50 asegura que esté sobre las demás tarjetas
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
          >
            {/* Contenido de la ventana emergente */}
            <motion.div 
              className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full"
              initial={{ y: "-100vh" }} 
              animate={{ y: "0" }} 
              exit={{ y: "-100vh" }}
            >
              <h2 className="text-black text-2xl font-bold mb-4">Feedback para {title}</h2>
              <p className="text-gray-600">{description}</p> {/* Descripción completa */}
              {/* Formulario de feedback */}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Calificación (1 a 10):
                </label>
                <input 
                  type="number" 
                  value={rating} 
                  onChange={handleRatingChange} 
                  min="1" 
                  max="10" 
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Comentarios:
                </label>
                <textarea 
                  value={feedback} 
                  onChange={handleFeedbackChange} 
                  className="w-full p-2 border rounded-lg" 
                  rows="4" 
                  placeholder="Escribe tu comentario aquí..."
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                {/* Botón para cerrar la ventana */}
                <motion.button 
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#636363' }}
                  onClick={handleCloseModal}
                >
                  Cancelar
                </motion.button>
                
                {/* Botón para enviar el feedback */}
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

// Componente principal que genera las tarjetas
const Calificar = () => {
  const programs = [
    {
      title: 'Community Food Drive',
      description: 'This program is dedicated to providing essential food supplies to families and individuals in need in our local communities. Volunteers are actively involved in distributing food packages every weekend and during special holiday drives. We collaborate with local businesses and donors to make sure no one goes hungry.',
      participants: 25,
      donations: 1500,
    },
    {
      title: 'Medical Aid Program',
      description: 'The Medical Aid Program focuses on providing essential healthcare services, including general check-ups, vaccinations, and emergency treatments, to communities with limited access to medical facilities. We work with local and international medical professionals to ensure the health and wellbeing of these populations.',
      participants: 40,
      donations: 2300,
    },
    {
      title: 'Education Support Initiative',
      description: 'Our Education Support Initiative provides free tutoring, school supplies, and financial assistance for students from low-income families. We believe every child deserves a fair chance at education, and our goal is to bridge the educational gap in underserved areas.',
      participants: 18,
      donations: 800,
    },
  ];

  return (
    // Flex para centrar y distribuir las tarjetas
    <div className="flex justify-center flex-wrap">
      {programs.map((program, index) => (
        <ProgramCard
          key={index}
          title={program.title}
          description={program.description}
          participants={program.participants}
          donations={program.donations}
        />
      ))}
    </div>
  );
};

export default Calificar;
