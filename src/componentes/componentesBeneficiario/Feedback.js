import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Typography } from '@mui/material';
import { FaCheck } from 'react-icons/fa';


const ProgramCard = ({ title, description, participants, donations, status, imageUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito
  const [errorRating, setErrorRating] = useState('');
  const [errorFeedback, setErrorFeedback] = useState('');



  // Variantes de animación para la palomita
  const checkmarkVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: { opacity: 1, pathLength: 1 },
  };

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
    let isValid = true; // Variable para verificar si los campos son válidos
  
    // Resetear los mensajes de error antes de validar
    setErrorRating('');
    setErrorFeedback('');
  
    // Validar que la calificación no esté vacía
    if (!rating || rating < 1 || rating > 10) {
      setErrorRating('Debes proporcionar una calificación entre 1 y 10.');
      isValid = false;
    }
  
    // Validar que los comentarios no estén vacíos
    if (!feedback.trim()) {
      setErrorFeedback('Debes proporcionar un comentario.');
      isValid = false;
    }
  
    // Si no es válido, no enviar feedback
    if (!isValid) return;
  
    // Aquí procesamos el feedback si es válido
    console.log(`Feedback enviado para ${title}:`);
    console.log(`Calificación: ${rating}`);
    console.log(`Comentario: ${feedback}`);
  
    resetForm(); // Reinicia el formulario
    setIsModalOpen(false); // Cierra el modal
    setSuccessMessage('Comentarios agregados exitosamente.'); // Muestra mensaje de éxito
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

  //Alerta se cierra automaticamente despues de 5 segundos
  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        setSuccessMessage('');
      }, 1000); // definir en cuanto tiempo desaparecera la alerta, se mide en ms (3 segundos)

    }
  }, [successMessage]);

  return (
    <>
      <motion.div 
        className="max-w-sm bg-gray-800 rounded-xl shadow-lg overflow-hidden m-4"
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.9 }}   
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
              whileHover={{ backgroundColor: '#636363', scale: 1.1 }}
              whileTap={{scale: 0.9}}
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
                  {errorRating && (
    <p className="text-red-500 text-sm mt-1">{errorRating}</p>
  )}
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
                {errorFeedback && (
    <p className="text-red-500 text-sm mt-1">{errorFeedback}</p>
  )}
              </div>
              
              <div className="flex justify-between mt-4">
                <motion.button 
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#636363', scale:1.1 }}
                  whileTap={{scale: 0.9}}
                  onClick={handleCloseModal}
                >
                  Cancelar
                </motion.button>
                
                <motion.button 
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  whileHover={{ backgroundColor: '#4A90E2', scale: 1.1 }}
                  whileTap={{scale: 0.9}}
                  onClick={handleSubmitFeedback}
                >
                  Enviar Feedback
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

       {/* Modal para mensajes de éxito */}
       <AnimatePresence>
      {successMessage && (
        <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2, ease: "easeIn" }}  // Animaciones de entrada/salida
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <motion.div 
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          exit={{ y: 50 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}  // Efecto de resorte en la entrada/salida
          className="bg-gray-800 p-6 rounded-xl shadow-lg">
                        {/* Icono de palomita */}
                     
            <h2 className="text-white text-2xl font-bold mb-4">{successMessage}</h2>
            <div className='flex justify-center items-center'>
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={checkmarkVariants}
              transition={{ duration: 1, ease: "easeInOut" }}
              className='flex justify-center items-center'
              style={{
                borderRadius: '50%',        // Hace que sea un círculo
                backgroundColor: '#4CAF50', // Color de fondo verde
                width: '80px',              // Tamaño del círculo
                height: '80px',             // Tamaño del círculo
                display: 'flex',            // Para alinear el contenido
                justifyContent: 'center',   // Centra horizontalmente
                alignItems: 'center'        // Centra verticalmente
              }}
            >
              <FaCheck size={50} className="text-white"/>
            </motion.div>
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
