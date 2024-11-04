import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Typography } from '@mui/material';
import StudentDashboard from './InterfazBeneficiario';

// Componente para mostrar una tarjeta de programa
const ProgramCard = ({ title, description, participants, donations, imageUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleOpenModal = (showDashboard = false) => {
    setShowDashboard(showDashboard);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <motion.div 
        className="max-w-sm bg-gray-800 rounded-xl shadow-lg overflow-hidden m-2"
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
          <p className="text-gray-400 mt-2">
            {description && description.length > 100 ? `${description.substring(0, 100)}...` : description}
          </p>
          <div className="mt-4">
            <span className="text-green-400">Participantes: {participants}</span>
          </div>
          <div className="mt-2">
            <span className="text-green-600">Donaciones: ${donations}</span>
          </div>
          <div className="flex mt-4 space-x-4">
            <motion.button
              className="bg-red-700 text-white px-4 py-2 rounded transition duration-300 hover:bg-red-600"
            >
              Salir
            </motion.button>
            <motion.button
              className="bg-gray-700 text-white px-4 py-2 rounded transition duration-300 hover:bg-gray-600"
              onClick={() => handleOpenModal(false)}
            >
              Más info
            </motion.button>
            <motion.button
              className="bg-gray-700 text-white px-4 py-2 rounded transition duration-300 hover:bg-gray-600"
              onClick={() => setShowDashboard(true)}
            >
              Tareas
            </motion.button>
          </div>
        </div>
      </motion.div>

      {showDashboard && (
        <div className="flex flex-col items-center mt-4">
          <motion.div className="bg-gray-900 p-4 rounded-xl shadow-lg w-full max-w-lg">
            <StudentDashboard />
          </motion.div>
          <motion.button
            className="bg-red-600 text-white px-4 py-2 rounded mt-4 transition duration-300 hover:bg-red-500 font-bold shadow-md"
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowDashboard(false)} // Función para cerrar el dashboard
          >
            Cerrar
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 p-8 rounded-xl shadow-lg max-w-lg w-full"
              initial={{ y: "-100vh" }}
              animate={{ y: "0" }}
              exit={{ y: "-100vh" }}
            >
              <h2 className="text-white text-3xl font-bold mb-4">{title}</h2>
              <p className="text-gray-600">{description}</p>
              <motion.button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded transition duration-300 hover:bg-blue-400"
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

// Componente principal para mostrar los programas
const MisProgramas = () => {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/programas', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}` // Token de autenticación
          }
        });

        const programData = await Promise.all(
          response.data.map(async (program) => {
            const participantsRes = await axios.get(`http://localhost:5000/programas/beneficiaries/count/${program.id}`).catch(() => ({ data: { count: 0 } }));
            const donationsRes = await axios.get(`http://localhost:5000/programas/expenses/total/${program.id}`).catch(() => ({ data: { total: 0 } }));

            return {
              ...program,
              participants: participantsRes.data.count,
              donations: donationsRes.data.total,
              imageUrl: program.program_image,
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
    <div className="mt-4">
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Mis Programas
      </Typography>

      <div className="flex justify-center flex-wrap mt-2">
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            title={program.name}
            description={program.description}
            participants={program.participants}
            donations={program.donations}
            imageUrl={program.imageUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default MisProgramas;
