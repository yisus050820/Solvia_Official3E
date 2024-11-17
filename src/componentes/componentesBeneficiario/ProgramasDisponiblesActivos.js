import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Typography } from '@mui/material';

const ProgramCard = ({ program }) => {
  const { name, description, participants, donations, status, program_image, coordinator_name } = program;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const modalContentRef = useRef(null);

  const handleScroll = () => {
    const modalContent = modalContentRef.current;
    if (modalContent) {
      setAtBottom(
        Math.ceil(modalContent.scrollTop + modalContent.clientHeight) >= modalContent.scrollHeight
      );
    }
  };

  useEffect(() => {
    const modalContent = modalContentRef.current;
    if (modalContent && atBottom) {
      modalContent.scrollTop = modalContent.scrollHeight;
    }
  }, [isModalOpen, atBottom]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
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
        className="max-w-sm bg-gray-800 rounded-xl shadow-lg overflow-hidden m-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          className="w-full h-48 object-cover"
          src={program_image ? `http://localhost:5000${program_image}` : "https://via.placeholder.com/150"}
          alt={name}
        />
        <div className="p-4">
          <h2 className="text-white text-xl font-bold">{name}</h2>
          <div className="flex items-center mt-2">
            <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(status)}`}></span>
            <span className="ml-2 text-gray-400 capitalize">{status}</span>
          </div>
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
              className="bg-gray-700 text-white px-4 py-2 rounded"
              whileHover={{ backgroundColor: '#636363', scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleOpenModal}
            >
              Más info
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
              ref={modalContentRef}
              onScroll={handleScroll}
              style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h2 className="text-white text-3xl font-bold">{name}</h2>
              <h4 className="text-white-900 mb-4 font-semibold">
                Coordinador: {coordinator_name ? coordinator_name : 'No disponible'}
              </h4>
              <img
                className="w-full h-48 object-cover shadow-md rounded"
                src={program_image ? `http://localhost:5000${program_image}` : "https://via.placeholder.com/150"}
                alt={name}
              />
              <p className="text-gray-400 mt-4">{description}</p>
              <motion.button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                whileHover={{ backgroundColor: '#4A90E2', scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
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

const ProgramasActivos = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }

    const fetchPrograms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/programas');
        const programData = await Promise.all(
          response.data
            .filter(program => program.status === 'active')
            .map(async (program) => {
              const participantsRes = await axios.get(`http://localhost:5000/programas/beneficiaries/count/${program.id}`);
              const donationsRes = await axios.get(`http://localhost:5000/programas/expenses/total/${program.id}`);
              return {
                ...program,
                participants: participantsRes.data.count,
                donations: donationsRes.data.total,
                program_image: program.program_image,
                coordinator_name: program.coordinator_name || 'No disponible',
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
        Programas Disponibles
      </Typography>

      <div className="flex justify-center flex-wrap mt-2">
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgramasActivos;
