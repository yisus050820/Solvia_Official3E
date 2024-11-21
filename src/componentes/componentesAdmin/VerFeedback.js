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

  const handleLogout = () => {
    localStorage.clear(); // Limpiar datos almacenados
    delete axios.defaults.headers.common['Authorization']; // Limpiar encabezados globales
    window.location.href = '/index'; // Redirigir a la página de inicio
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
      <button
        onClick={handleLogout}
        style={{
          position: 'fixed', // El botón se mantiene fijo en la parte superior derecha
          top: '20px', // Ajusta la distancia desde el borde superior
          right: '20px', // Ajusta la distancia desde el borde derecho
          backgroundColor: '#ff0000', // Color rojo brillante
          color: 'white', // Color del texto
          border: 'none',
          padding: '10px 15px',
          borderRadius: '5px',
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)', // Sombra para visibilidad
          zIndex: 9999, // Asegura que el botón se vea por encima de otros elementos
        }}
      >
        Cerrar sesión
      </button>
      
      <motion.div
        className="max-w-sm rounded-xl shadow-lg overflow-hidden m-4"
        style={{ backgroundColor: '#383D3B' }} // Fondo principal oscuro
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img
          className="w-full h-48 object-cover"
          src={imageUrl ? `http://localhost:5000${imageUrl}` : "https://via.placeholder.com/150"}
          alt={title}
        />
        <div className="p-4" style={{ backgroundColor: '#383D3B' }}> {/* Fondo claro para el contenido */}
          <h2 className="text-xl font-bold" style={{ color: '#92DCE5' }}>{title}</h2> {/* Título con azul claro */}
          <div className="flex items-center mt-2">
            <span
              className={`inline-block w-3 h-3 rounded-full ${getStatusColor(status)}`}
            ></span>
            <span className="ml-2 capitalize" style={{ color: 'white' }}>{status}</span> {/* Texto gris medio */}
          </div>
          <p className="mt-2" style={{ color: 'white' }}>
            {description && description.length > 100 ? `${description.substring(0, 100)}...` : description}
          </p>
          <div className="mt-4">
            <span style={{ color: '#92DCE5' }}>Participantes: {participants}</span> {/* Azul claro */}
          </div>
          <div className="mt-2">
            <span style={{ color: 'green' }}>Presupuesto: {donations ? `$${donations}` : "No asignado"}</span> {/* Gris medio */}
          </div>
          <div className="flex mt-4 space-x-4">
            <motion.button
              className="px-4 py-2 rounded"
              style={{
                backgroundColor: '#0097A7', // Fondo gris medio
                color: '#EEE5E9', // Texto claro
              }}
              whileHover={{ scale: 1.1 }} // Cambia a azul claro al hover
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
            className="fixed inset-0 flex justify-center items-center z-50"
            style={{ backgroundColor: 'rgba(56, 61, 59, 0.8)' }} // Fondo con transparencia (oscuro)
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="p-8 rounded-xl shadow-lg max-w-lg w-full"
              style={{
                backgroundColor: '#EEE5E9', // Fondo claro para el modal
                color: '#383D3B', // Texto oscuro
              }}
              initial={{ y: "-100vh" }}
              animate={{ y: "0" }}
              exit={{ y: "-100vh" }}
            >
              <h2 className="text-2xl font-bold mb-4">Feedback de {title}</h2>
              <div
                ref={userListRef}
                className="overflow-y-auto max-h-96" // Max height for scrollable area
                onScroll={handleScroll}
              >
                <ul>
                  {feedbacks.length > 0 ? (
                    feedbacks.map((fb, index) => (
                      <li key={index} className="mb-6">
                        <div className="font-bold" style={{ color: '#383D3B' }}>{fb.username}:</div>
                        <div className="flex items-center mt-1">{renderStars(fb.rating)}</div>
                        <p className="mt-2" style={{ color: '#7C7C7C' }}>{fb.message}</p> {/* Texto gris medio */}
                      </li>
                    ))
                  ) : (
                    <p>No hay feedback disponible.</p>
                  )}
                </ul>
              </div>
              <motion.button
                className="mt-4 px-4 py-2 rounded"
                style={{
                  backgroundColor: '#92DCE5', // Azul claro
                  color: '#383D3B', // Texto oscuro
                }}
                whileHover={{ backgroundColor: '#7C7C7C', scale: 1.1 }} // Gris medio al hover
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
}

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
