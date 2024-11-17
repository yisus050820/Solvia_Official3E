import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Typography } from '@mui/material';
import { FaStar } from 'react-icons/fa';
import { Feed } from '@mui/icons-material';

const ProgramCard = ({ title, description, participants, donations, status, imageUrl, programId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atBottom, setAtBottom] = useState(true);
  const userListRef = useRef(null); // Reference for the feedback list

  const handleScroll = () => {
    const userListContainer = userListRef.current;
    if (userListContainer) {
      setAtBottom(userListContainer.scrollHeight - userListContainer.scrollTop === userListContainer.clientHeight);
    }
  };
  
  useEffect(() => {
    const userListContainer = userListRef.current;
    if (userListContainer && atBottom) {
      userListContainer.scrollTop = userListContainer.scrollHeight;
    }
  }, [atBottom]);

  const handleOpenModal = async () => {

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }

    setIsModalOpen(true);
    try {
      const response = await axios.get(`http://localhost:5000/feedback/${programId}/feed`);
      const uniqueFeedbacks = Object.values(response.data.reduce((acc, curr) => {
        acc[curr.username] = curr;
        return acc;
      }, {}));
      setFeedbacks(uniqueFeedbacks);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedbacks([]);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFeedbacks([]);
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

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? "text-yellow-500" : "text-gray-300"}
      />
    ));
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
            {description && description.length > 100 ? `${description.substring(0, 100)}...` : description}
          </p>
          <div className="mt-4">
            <span className="text-green-400">Participantes: {participants}</span>
          </div>
          <div className="mt-2">
            <span className="text-green-600">Presupuesto: {donations ? `$${donations}` : "No asignado"}</span>
          </div>
          <div className="flex mt-4 space-x-4">
            <motion.button
              className="bg-gray-700 text-white px-4 py-2 rounded"
              whileHover={{ backgroundColor: '#636363', scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleOpenModal}
            >
              Ver Feedback
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
              className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full"
              initial={{ y: "-100vh" }}
              animate={{ y: "0" }}
              exit={{ y: "-100vh" }}
            >
              <h2 className="text-black text-2xl font-bold mb-4">Feedback de {title}</h2>
              <div
                ref={userListRef}
                className="overflow-y-auto max-h-96" // Max height for scrollable area
                onScroll={handleScroll}
              >
                <ul className="text-gray-600">
                  {feedbacks.length > 0 ? (
                    feedbacks.map((fb, index) => (
                      <li key={index} className="mb-6">
                        <div className="font-bold text-gray-800">{fb.username}:</div>
                        <div className="flex items-center mt-1">{renderStars(fb.rating)}</div>
                        <p className="text-gray-700 mt-2">{fb.message}</p>
                      </li>
                    ))
                  ) : (
                    <p>No hay feedback disponible.</p>
                  )}
                </ul>
              </div>
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

const VerFeedback = () => {
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
          response.data.map(async (program) => {
            const participantsRes = await axios.get(`http://localhost:5000/programas/beneficiaries/count/${program.id}`);
            const donationsRes = await axios.get(`http://localhost:5000/programas/expenses/total/${program.id}`);
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
    <div>
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Ver Feedback
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
            programId={program.id}
          />
        ))}
      </div>
    </div>
  );
};

export default VerFeedback;
