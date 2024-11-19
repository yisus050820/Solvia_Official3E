import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Typography } from '@mui/material';
import TeacherDashboard from './InterfazVoluntario';

const ProgramCard = ({ title, description, participants, donations, imageUrl, programId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const modalContentRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);

  const handleOpenModal = (showDashboard = false) => {
    setShowDashboard(showDashboard);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowDashboard(false);
  };

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
  }, [atBottom]);

  return (
    <>
      <motion.div
        className="max-w-sm rounded-xl shadow-lg overflow-hidden m-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          backgroundColor: '#383D3B', // Fondo de la tarjeta
        }}
      >
        <img
          className="w-full h-48 object-cover"
          src={imageUrl ? `http://localhost:5000${imageUrl}` : "https://via.placeholder.com/150"}
          alt={title}
        />
        <div className="p-4">
          <h2 style={{ color: '#EEE5E9' }} className="text-xl font-bold">{title}</h2>
          <p style={{ color: 'white' }} className="mt-2">
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
              className="px-4 py-2 rounded"
              whileHover={{ scale: 1.1 }}
              onClick={() => handleOpenModal(false)}
              style={{
                backgroundColor: '#0097A7',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              Más info
            </motion.button>
            <motion.button
              className="px-4 py-2 rounded bg-[#EEE5E9]"
              whileHover={{ scale: 1.1 }}
              onClick={() => handleOpenModal(true)}
              style={{
                backgroundColor: '#EEE5E9',
                color: '#383D3B',
                fontWeight: 'bold',
              }}
            >
              Gestionar
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
              className="text-white p-8 rounded-xl shadow-lg w-full"
              initial={{ y: "-100vh" }}
              animate={{ y: "0" }}
              exit={{ y: "-100vh" }}
              ref={modalContentRef}
              onScroll={handleScroll}
              style={{
                backgroundColor: '#383D3B',
                maxHeight: '90vh',
                maxWidth: '800Px', // Ajusta el ancho intermedio entre 3xl (768px) y 4xl (1024px)
                overflowY: 'auto',
              }}
            >

              {showDashboard ? (
                <TeacherDashboard programId={programId} />
              ) : (
                <>
                  <h2 style={{ color: '#EEE5E9' }} className="text-3xl font-bold">{title}</h2>
                  <img
                    className="w-full h-48 object-cover shadow-md rounded"
                    src={imageUrl ? `http://localhost:5000${imageUrl}` : "https://via.placeholder.com/150"}
                    alt={title}
                  />
                  <p style={{ color: 'white' }} className="mt-4">{description}</p>
                </>
              )}
              <motion.button
                className="mt-4 px-4 py-2 rounded transition duration-300 font-bold shadow-md"
                whileHover={{ scale: 1.05 }}
                onClick={handleCloseModal}
                style={{
                  backgroundColor: '#FF6347',
                  color: '#FFF',
                }}
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

const MisProgramasVol = () => {
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
        const response = await axios.get('http://localhost:5000/taskVol/programas', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const programData = await Promise.all(
          response.data.map(async (program) => {
            const participantsRes = await axios
              .get(`http://localhost:5000/programas/beneficiaries/count/${program.id}`)
              .catch(() => ({ data: { count: 0 } }));
            const donationsRes = await axios
              .get(`http://localhost:5000/programas/expenses/total/${program.id}`)
              .catch(() => ({ data: { total: 0 } }));

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
      <Typography variant="h3" align="center" color="primary" sx={{ marginBottom: 0 }}>
        Mis programas
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
            programId={program.id}
          />
        ))}
      </div>
    </div>
  );
};

export default MisProgramasVol;
