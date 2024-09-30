import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProgramCard = ({ title, description, participants, donations }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
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
          {/* Limitar la descripción a un máximo de 100 caracteres */}
          <p className="text-gray-400 mt-2">
            {description.length > 100 ? `${description.substring(0, 100)}...` : description}
          </p>
          {/* Participantes */}
          <div className="mt-4">
            <span className="text-green-400">Participantes: {participants}</span>
          </div>
          {/* Donaciones */}
          <div className="mt-2">
            <span className="text-green-600">Donaciones: ${donations}</span>
          </div>
          <div className="flex mt-4 space-x-4">
            <motion.button 
              className="bg-red-500 text-white px-4 py-2 rounded"
              whileHover={{ backgroundColor: '#DC2626' }}
            >
              Salir del Programa
            </motion.button>
            {/* Botón para abrir la ventana emergente */}
            <motion.button 
              className="bg-gray-700 text-white px-4 py-2 rounded"
              whileHover={{ backgroundColor: '#636363' }}
              onClick={handleOpenModal}
            >
              Más info
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
              <h2 className="text-black text-2xl font-bold mb-4">{title}</h2>
              <p className="text-gray-600">{description}</p> {/* Descripción completa */}
              {/* Botón para cerrar la ventana */}
              <motion.button 
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                whileHover={{ backgroundColor: '#4A90E2' }}
                onClick={handleCloseModal}
              >
                Cerrar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Componente principal que genera las tarjetas
const ProgramasInscrito = () => {
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

export default ProgramasInscrito;