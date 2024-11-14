import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Typography } from '@mui/material';
import axios from 'axios';

const HistorialDonaciones = () => {
  const [donaciones, setDonaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }

    const fetchDonations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/donar', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        setDonaciones(response.data);
      } catch (error) {
        console.error('Error fetching donations:', error);
      }
    };

    fetchDonations();
  }, []);

  return (
    <>
      <div className="w-full px-6 py-4 mx-auto mt-2">
        <Typography 
          variant="h3" 
          align="center" 
          color="primary" 
          gutterBottom
        >
          Historial de Donaciones
        </Typography>

        <motion.table
          className="w-full bg-gray-800 text-white rounded-lg shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 text-left">Cantidad (MXN)</th>
              <th className="p-4 text-left">Fecha</th>
            </tr>
          </thead>
          <motion.tbody layout>
            {donaciones.map((donacion, index) => (
              <motion.tr
                key={index}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="border-b border-gray-700"
              >
                <td className="p-4">
                  {Number(donacion.amount).toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  })}
                </td>
                <td className="p-4">{donacion.date}</td>
              </motion.tr>
            ))}
          </motion.tbody>
        </motion.table>
      </div>
    </>
  );
};

export default HistorialDonaciones;
