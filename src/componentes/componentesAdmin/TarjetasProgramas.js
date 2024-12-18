import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Typography, Button } from '@mui/material';  // Importando Typography para el título

const ProgramCard = ({ title, description, participants, donations, status, imageUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Función para determinar el color del estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';  // Verde para activo
      case 'pause':
        return 'bg-yellow-500'; // Amarillo para pausado
      case 'unactive':
        return 'bg-red-500';    // Rojo para inactivo
      default:
        return 'bg-gray-500';   // Gris por defecto
    }
  };

  return (
    <>
      {/* Tarjeta del programa */}
      <motion.div 
        className="max-w-sm bg-gray-800 rounded-xl shadow-lg overflow-hidden m-2"  // Reducido el margen de m-4 a m-2
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}   
      >
        {/* Imagen del programa */}
        <img
          className="w-full h-48 object-cover"
          src={imageUrl ? `http://localhost:5000${imageUrl}` : "https://via.placeholder.com/150"}
          alt={title}
        />
        {/* Contenido principal de la tarjeta */}
        <div className="p-4">
          <h2 className="text-white text-xl font-bold">{title}</h2>
          {/* Estado del programa con un círculo de color */}
          <div className="flex items-center mt-2">
            <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(status)}`}></span>
            <span className="ml-2 text-gray-400 capitalize">{status}</span>
          </div>
          {/* Limitar la descripción a un máximo de 100 caracteres */}
          <p className="text-gray-400 mt-2">
            {description && description.length > 100 ? `${description.substring(0, 100)}...` : description}
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
            {/* Botón para abrir la ventana emergente */}
            <motion.button 
              className="bg-gray-700 text-white px-4 py-2 rounded"
              whileHover={{ backgroundColor: '#636363', scale: 1.1 }}
              whileTap={{scale: 0.9}}
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
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"  
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
                whileHover={{ backgroundColor: '#4A90E2', scale: 1.1 }}
                whileTap={{scale: 0.9}}
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

const TarjetasProgramas = () => {
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
              imageUrl: program.program_image, // Añadido para manejar la imagen del programa
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
    <div className="mt-4"> {/* Ajusta el margen superior */}
      {/* Título de la sección */}
      <Typography variant="h3" align="center" color="primary" gutterBottom>
        Programas Disponibles
      </Typography>

      <div className="flex justify-center flex-wrap mt-2">  {/* Reducido el margen superior */}
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            title={program.name}
            description={program.description}
            participants={program.participants}
            donations={program.donations}
            status={program.status} 
            imageUrl={program.imageUrl} // Pasar la URL de la imagen al componente
          />
        ))}
      </div>
    </div>
  );
};

export default TarjetasProgramas;
